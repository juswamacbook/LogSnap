import cors from 'cors';
import express from 'express';

import {
  addJobNote,
  addJobPhotos,
  completeJob,
  getJobRecord,
  listJobRecords,
  startJob,
  submitJob,
  updateChecklist,
} from './store';
import { CapturedPhoto, ChecklistState } from './types';

const app = express();
const port = Number(process.env.PORT ?? 4000);

app.use(cors());
app.use(express.json({ limit: '2mb' }));

app.get('/api/health', (_req, res) => {
  res.json({
    ok: true,
    service: 'logsnap-backend',
    timestamp: Date.now(),
  });
});

app.get('/api/jobs', (_req, res) => {
  res.json({
    jobs: listJobRecords().map((record) => ({
      ...record.job,
      activity: record.activity,
    })),
  });
});

app.get('/api/jobs/:jobId', (req, res) => {
  const record = getJobRecord(req.params.jobId);

  if (!record) {
    res.status(404).json({ error: 'Job not found' });
    return;
  }

  res.json(record);
});

app.post('/api/jobs/:jobId/start', (req, res) => {
  const startTime = Number(req.body?.startTime ?? Date.now());
  const record = startJob(req.params.jobId, startTime);

  if (!record) {
    res.status(404).json({ error: 'Job not found' });
    return;
  }

  res.json(record);
});

app.post('/api/jobs/:jobId/notes', (req, res) => {
  const note = String(req.body?.note ?? '').trim();

  if (!note) {
    res.status(400).json({ error: 'note is required' });
    return;
  }

  const record = addJobNote(req.params.jobId, note);

  if (!record) {
    res.status(404).json({ error: 'Job not found' });
    return;
  }

  res.status(201).json(record);
});

app.post('/api/jobs/:jobId/photos', (req, res) => {
  const photos = Array.isArray(req.body?.photos) ? (req.body.photos as CapturedPhoto[]) : [];

  if (photos.length === 0) {
    res.status(400).json({ error: 'photos array is required' });
    return;
  }

  const record = addJobPhotos(req.params.jobId, photos);

  if (!record) {
    res.status(404).json({ error: 'Job not found' });
    return;
  }

  res.status(201).json(record);
});

app.patch('/api/jobs/:jobId/checklist', (req, res) => {
  const checklistState = (req.body?.checklistState ?? {}) as Partial<ChecklistState>;
  const record = updateChecklist(req.params.jobId, checklistState);

  if (!record) {
    res.status(404).json({ error: 'Job not found' });
    return;
  }

  res.json(record);
});

app.post('/api/jobs/:jobId/review', (req, res) => {
  const endTime = Number(req.body?.endTime ?? Date.now());
  const record = completeJob(req.params.jobId, endTime);

  if (!record) {
    res.status(404).json({ error: 'Job not found' });
    return;
  }

  res.json({
    job: record.job,
    review: {
      checklistState: record.activity.checklistState,
      duration: record.activity.startTime ? endTime - record.activity.startTime : 0,
      endTime,
      notes: record.activity.notes,
      photos: record.activity.photos,
      startTime: record.activity.startTime ?? null,
    },
  });
});

app.post('/api/jobs/:jobId/submit', async (req, res) => {
  const submittedAt = Number(req.body?.submittedAt ?? Date.now());
  const record = submitJob(req.params.jobId, submittedAt);

  if (!record) {
    res.status(404).json({ error: 'Job not found' });
    return;
  }

  await new Promise((resolve) => setTimeout(resolve, 300));

  res.json({
    ok: true,
    jobId: record.job.id,
    submittedAt,
    duration:
      record.activity.startTime && record.activity.endTime
        ? record.activity.endTime - record.activity.startTime
        : 0,
  });
});

app.listen(port, () => {
  // eslint-disable-next-line no-console
  console.log(`LogSnap backend listening on http://localhost:${port}`);
});
