export type JobStatus =
  | 'not_started'
  | 'in_progress'
  | 'awaiting_completion_upload'
  | 'completed';

export type FinalPhoto = {
  uri: string;
  timestamp: number;
};

export type Job = {
  id: string;
  siteName: string;
  address: string;
  timeWindow: string;
  jobType: string;
  status: JobStatus;
  isHighlighted?: boolean;
  phone: string;
  contactName: string;
  issue: string;
  zoneLabel: string;
};

export type JobActivity = {
  startTime?: number;
  endTime?: number;
  completionNote: string;
  finalPhotos: FinalPhoto[];
  submittedAt?: number;
};

export type JobRecord = {
  job: Job;
  activity: JobActivity;
};
