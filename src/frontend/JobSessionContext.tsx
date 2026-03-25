import React, { createContext, ReactNode, useContext, useMemo, useState } from 'react';

import { FinalPhoto, INITIAL_JOB_RECORDS, JobRecord, SavedVoiceNote } from './jobData';

type JobSessionContextValue = {
  records: JobRecord[];
  getRecord: (jobId: string) => JobRecord | undefined;
  startJob: (jobId: string, startTime?: number) => number | null;
  finishJob: (jobId: string, endTime?: number) => number | null;
  addFinalPhoto: (jobId: string, photo: FinalPhoto) => void;
  addVoiceNote: (jobId: string, note: SavedVoiceNote) => void;
  setCompletionNote: (jobId: string, note: string) => void;
  submitJob: (jobId: string, submittedAt?: number) => void;
};

const JobSessionContext = createContext<JobSessionContextValue | null>(null);

function cloneInitialRecords() {
  return INITIAL_JOB_RECORDS.map((record) => ({
    activity: {
      ...record.activity,
      finalPhotos: [...record.activity.finalPhotos],
      voiceNotes: [...record.activity.voiceNotes],
    },
    job: { ...record.job },
  }));
}

export function JobSessionProvider({ children }: { children: ReactNode }) {
  const [records, setRecords] = useState<JobRecord[]>(cloneInitialRecords);

  const value = useMemo<JobSessionContextValue>(
    () => ({
      records,
      getRecord: (jobId) => records.find((record) => record.job.id === jobId),
      startJob: (jobId, startTime = Date.now()) => {
        let startedAt: number | null = null;

        setRecords((current) =>
          current.map((record) => {
            if (record.job.id !== jobId) {
              return record;
            }

            startedAt = record.activity.startTime ?? startTime;

            return {
              ...record,
              activity: {
                ...record.activity,
                completionNote: '',
                endTime: undefined,
                finalPhotos: [],
                startTime: startedAt,
                submittedAt: undefined,
                voiceNotes: [],
              },
              job: {
                ...record.job,
                status: 'in_progress',
              },
            };
          }),
        );

        return startedAt;
      },
      finishJob: (jobId, endTime = Date.now()) => {
        let completedAt: number | null = null;

        setRecords((current) =>
          current.map((record) => {
            if (record.job.id !== jobId) {
              return record;
            }

            completedAt = endTime;

            return {
              ...record,
              activity: {
                ...record.activity,
                endTime,
              },
              job: {
                ...record.job,
                status: 'awaiting_completion_upload',
              },
            };
          }),
        );

        return completedAt;
      },
      addFinalPhoto: (jobId, photo) => {
        setRecords((current) =>
          current.map((record) => {
            if (record.job.id !== jobId) {
              return record;
            }

            return {
              ...record,
              activity: {
                ...record.activity,
                finalPhotos: [...record.activity.finalPhotos, photo],
              },
            };
          }),
        );
      },
      addVoiceNote: (jobId, note) => {
        setRecords((current) =>
          current.map((record) => {
            if (record.job.id !== jobId) {
              return record;
            }

            return {
              ...record,
              activity: {
                ...record.activity,
                voiceNotes: [...record.activity.voiceNotes, note],
              },
            };
          }),
        );
      },
      setCompletionNote: (jobId, note) => {
        setRecords((current) =>
          current.map((record) => {
            if (record.job.id !== jobId) {
              return record;
            }

            return {
              ...record,
              activity: {
                ...record.activity,
                completionNote: note,
              },
            };
          }),
        );
      },
      submitJob: (jobId, submittedAt = Date.now()) => {
        setRecords((current) =>
          current.map((record) => {
            if (record.job.id !== jobId) {
              return record;
            }

            return {
              ...record,
              activity: {
                ...record.activity,
                endTime: record.activity.endTime ?? submittedAt,
                submittedAt,
              },
              job: {
                ...record.job,
                status: 'completed',
              },
            };
          }),
        );
      },
    }),
    [records],
  );

  return <JobSessionContext.Provider value={value}>{children}</JobSessionContext.Provider>;
}

export function useJobSession() {
  const context = useContext(JobSessionContext);

  if (!context) {
    throw new Error('useJobSession must be used within a JobSessionProvider');
  }

  return context;
}
