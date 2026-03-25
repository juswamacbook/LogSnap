export type JobStatus =
  | 'not_started'
  | 'in_progress'
  | 'awaiting_completion_upload'
  | 'completed';

export type FinalPhoto = {
  id: string;
  uri: string;
  timestamp: number;
};

export type VoiceMode = 'voice' | 'text';

export type SavedVoiceNote = {
  durationSeconds: number;
  id: string;
  mode: VoiceMode;
  savedAt: number;
  transcript: string;
  uri: string | null;
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
  voiceNotes: SavedVoiceNote[];
};

export type JobRecord = {
  job: Job;
  activity: JobActivity;
};

export const MOCK_IMAGE_URI = `data:image/svg+xml;utf8,${encodeURIComponent(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 420 300">
    <rect width="420" height="300" rx="28" fill="#D7E6F1"/>
    <rect x="24" y="24" width="372" height="252" rx="22" fill="#B9CFE2"/>
    <circle cx="110" cy="102" r="26" fill="#F7FBFF"/>
    <path d="M62 224l78-70 52 44 52-58 114 84H62z" fill="#0F2D54"/>
    <path d="M146 224l44-40 34 28 40-48 94 60H146z" fill="#7BA46B"/>
    <rect x="40" y="240" width="120" height="14" rx="7" fill="#F7FBFF"/>
  </svg>`,
)}`;

export const REFERENCE_IMAGE_URI = `data:image/svg+xml;utf8,${encodeURIComponent(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 420">
    <rect width="640" height="420" rx="36" fill="#F2F5F8"/>
    <rect x="28" y="28" width="584" height="364" rx="28" fill="#DCE6EE"/>
    <rect x="78" y="84" width="484" height="220" rx="22" fill="#B7CDE0"/>
    <rect x="116" y="128" width="408" height="24" rx="12" fill="#F7FBFF"/>
    <rect x="116" y="172" width="240" height="18" rx="9" fill="#E7F0F8"/>
    <rect x="116" y="202" width="316" height="18" rx="9" fill="#E7F0F8"/>
    <circle cx="486" cy="194" r="44" fill="#0F2D54"/>
    <path d="M472 195l10 10 22-28" fill="none" stroke="#FFFFFF" stroke-width="12" stroke-linecap="round" stroke-linejoin="round"/>
    <rect x="116" y="330" width="120" height="18" rx="9" fill="#7BA46B"/>
    <rect x="248" y="330" width="172" height="18" rx="9" fill="#D85A30"/>
  </svg>`,
)}`;

export const INITIAL_JOB_RECORDS: JobRecord[] = [
  {
    job: {
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
    activity: {
      completionNote: '',
      finalPhotos: [],
      voiceNotes: [],
    },
  },
  {
    job: {
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
    activity: {
      completionNote: '',
      finalPhotos: [],
      voiceNotes: [],
    },
  },
  {
    job: {
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
    activity: {
      completionNote: '',
      finalPhotos: [],
      voiceNotes: [],
    },
  },
];

export function getJobStatusLabel(status: JobStatus) {
  switch (status) {
    case 'in_progress':
      return 'In Progress';
    case 'awaiting_completion_upload':
      return 'Awaiting Final Photos';
    case 'completed':
      return 'Report Ready';
    case 'not_started':
    default:
      return 'Ready';
  }
}

export function formatElapsedDuration(totalSeconds: number) {
  const safeTotal = Math.max(0, totalSeconds);
  const hours = Math.floor(safeTotal / 3600);
  const minutes = Math.floor((safeTotal % 3600) / 60);
  const seconds = safeTotal % 60;

  if (hours > 0) {
    return [hours, minutes, seconds].map((value) => value.toString().padStart(2, '0')).join(':');
  }

  return [minutes, seconds].map((value) => value.toString().padStart(2, '0')).join(':');
}

export function formatDurationFromMs(durationMs: number) {
  return formatElapsedDuration(Math.floor(durationMs / 1000));
}

export function buildReportSummary(record: JobRecord) {
  const note = record.activity.completionNote.trim();

  if (note) {
    return `Job completed successfully. Work session recorded, final site photos attached, and crew note logged: ${note}`;
  }

  return 'Job completed successfully. Work session recorded and final site photos attached.';
}
