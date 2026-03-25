import { FinalPhoto, Job, JobRecord } from './types';

const jobs: Job[] = [
  {
    id: '1',
    siteName: 'Ridgewood Commons',
    address: '4510 Ridgewood Ave, Unit B',
    timeWindow: '10:00 – 11:30 AM',
    jobType: 'Sprinkler Repair',
    status: 'not_started',
    isHighlighted: true,
    contactName: 'Ron Fielding',
    phone: '(416) 555-0188',
    issue:
      'Zone 3 not activating. Possible solenoid failure or broken line near south bed.',
    zoneLabel: 'Zone 3',
  },
  {
    id: '2',
    siteName: 'Hartwell Plaza',
    address: '78 Commerce Blvd',
    timeWindow: '8:00 – 9:30 AM',
    jobType: 'Backflow Test',
    status: 'not_started',
    contactName: 'Elena Torres',
    phone: '(416) 555-0142',
    issue:
      'Annual backflow inspection required after a failed valve reading last service cycle.',
    zoneLabel: 'Main Valve',
  },
  {
    id: '3',
    siteName: 'Elmwood Residential',
    address: '112 Elmwood Dr',
    timeWindow: '1:00 – 2:30 PM',
    jobType: 'Zone Inspection',
    status: 'not_started',
    contactName: 'Marcus Chen',
    phone: '(416) 555-0176',
    issue:
      'Resident reported uneven coverage along the east lawn. Inspect heads, pressure, and timer programming.',
    zoneLabel: 'East Lawn',
  },
];

const records = new Map<string, JobRecord>(
  jobs.map((job) => [
    job.id,
    {
      activity: {
        completionNote: '',
        finalPhotos: [],
      },
      job,
    },
  ]),
);

export function listJobRecords() {
  return Array.from(records.values());
}

export function getJobRecord(jobId: string) {
  return records.get(jobId) ?? null;
}

export function startJob(jobId: string, startTime: number) {
  const record = getJobRecord(jobId);

  if (!record) {
    return null;
  }

  record.job.status = 'in_progress';
  record.activity.startTime = startTime;
  return record;
}

export function setJobCompletionNote(jobId: string, note: string) {
  const record = getJobRecord(jobId);

  if (!record) {
    return null;
  }

  record.activity.completionNote = note;
  return record;
}

export function addFinalJobPhotos(jobId: string, photos: FinalPhoto[]) {
  const record = getJobRecord(jobId);

  if (!record) {
    return null;
  }

  record.activity.finalPhotos.push(...photos);
  return record;
}

export function finishJob(jobId: string, endTime: number) {
  const record = getJobRecord(jobId);

  if (!record) {
    return null;
  }

  record.job.status = 'awaiting_completion_upload';
  record.activity.endTime = endTime;
  return record;
}

export function submitJob(
  jobId: string,
  payload: {
    endTime?: number;
    completionNote?: string;
    photos?: FinalPhoto[];
    submittedAt: number;
  },
) {
  const record = getJobRecord(jobId);

  if (!record) {
    return null;
  }

  if (payload.endTime) {
    record.activity.endTime = payload.endTime;
  }

  if (typeof payload.completionNote === 'string') {
    record.activity.completionNote = payload.completionNote;
  }

  if (payload.photos && payload.photos.length > 0) {
    record.activity.finalPhotos.push(...payload.photos);
  }

  if (!record.activity.endTime) {
    record.activity.endTime = payload.submittedAt;
  }

  record.activity.submittedAt = payload.submittedAt;
  record.job.status = 'completed';
  return record;
}
