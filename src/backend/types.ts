export type JobStatus =
  | 'overdue'
  | 'starting_soon'
  | 'in_progress'
  | 'scheduled'
  | 'completed';

export type PhotoTag = 'Before' | 'During' | 'After';

export type CapturedPhoto = {
  uri: string;
  tag: PhotoTag;
  timestamp: number;
};

export type ChecklistState = {
  beforePhoto: boolean;
  issueNoted: boolean;
  afterPhoto: boolean;
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
  notes: string[];
  photos: CapturedPhoto[];
  checklistState: ChecklistState;
  submittedAt?: number;
};

export type JobRecord = {
  job: Job;
  activity: JobActivity;
};
