import {
  CapturedPhoto,
  ChecklistState,
  Job,
  JobRecord,
} from './types';

const defaultChecklist = (): ChecklistState => ({
  beforePhoto: false,
  issueNoted: false,
  afterPhoto: false,
});

const jobs: Job[] = [
  {
    id: '1',
    siteName: 'Ridgewood Commons',
    address: '4510 Ridgewood Ave, Unit B',
    timeWindow: '10:00 – 11:30 AM',
    jobType: 'Sprinkler Repair',
    status: 'starting_soon',
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
    status: 'overdue',
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
    status: 'scheduled',
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
      job,
      activity: {
        checklistState: defaultChecklist(),
        notes: [],
        photos: [],
      },
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

export function addJobNote(jobId: string, note: string) {
  const record = getJobRecord(jobId);

  if (!record) {
    return null;
  }

  record.activity.notes.push(note);
  record.activity.checklistState.issueNoted = true;
  return record;
}

export function addJobPhotos(jobId: string, photos: CapturedPhoto[]) {
  const record = getJobRecord(jobId);

  if (!record) {
    return null;
  }

  record.activity.photos.push(...photos);

  for (const photo of photos) {
    if (photo.tag === 'Before') {
      record.activity.checklistState.beforePhoto = true;
    }
    if (photo.tag === 'After') {
      record.activity.checklistState.afterPhoto = true;
    }
  }

  return record;
}

export function updateChecklist(jobId: string, checklistState: Partial<ChecklistState>) {
  const record = getJobRecord(jobId);

  if (!record) {
    return null;
  }

  record.activity.checklistState = {
    ...record.activity.checklistState,
    ...checklistState,
  };

  return record;
}

export function completeJob(jobId: string, endTime: number) {
  const record = getJobRecord(jobId);

  if (!record) {
    return null;
  }

  record.job.status = 'completed';
  record.activity.endTime = endTime;
  return record;
}

export function submitJob(jobId: string, submittedAt: number) {
  const record = getJobRecord(jobId);

  if (!record) {
    return null;
  }

  record.activity.submittedAt = submittedAt;
  if (!record.activity.endTime) {
    record.activity.endTime = submittedAt;
  }
  record.job.status = 'completed';
  return record;
}
