import cors from 'cors';
import express from 'express';

import {
  addFinalJobPhotos,
  finishJob,
  getJobRecord,
  listJobRecords,
  setJobCompletionNote,
  startJob,
  submitJob,
} from './store';
import { FinalPhoto } from './types';

const app = express();
const port = Number(process.env.PORT ?? 4000);

app.use(cors());
app.use(express.json({ limit: '2mb' }));

const apiEndpoints = [
  'GET /api/health',
  'GET /api/jobs',
  'GET /api/jobs/:jobId',
  'POST /api/jobs/:jobId/start',
  'POST /api/jobs/:jobId/note',
  'POST /api/jobs/:jobId/finish',
  'POST /api/jobs/:jobId/photos',
  'POST /api/jobs/:jobId/submit',
];

app.get('/', (_req, res) => {
  res.json({
    ok: true,
    service: 'logsnap-backend',
    message: 'Backend is running. Use the /api routes.',
    endpoints: apiEndpoints,
  });
});

app.get('/api', (_req, res) => {
  res.json({
    ok: true,
    service: 'logsnap-backend',
    message: 'API is running.',
    endpoints: apiEndpoints,
  });
});

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

app.post('/api/jobs/:jobId/note', (req, res) => {
  const note = String(req.body?.note ?? '');

  const record = setJobCompletionNote(req.params.jobId, note);

  if (!record) {
    res.status(404).json({ error: 'Job not found' });
    return;
  }

  res.status(201).json(record);
});

app.post('/api/jobs/:jobId/finish', (req, res) => {
  const endTime = Number(req.body?.endTime ?? Date.now());
  const record = finishJob(req.params.jobId, endTime);

  if (!record) {
    res.status(404).json({ error: 'Job not found' });
    return;
  }

  res.json({
    job: record.job,
    completion: {
      duration: record.activity.startTime ? endTime - record.activity.startTime : 0,
      endTime,
      finalPhotos: record.activity.finalPhotos,
      completionNote: record.activity.completionNote,
      startTime: record.activity.startTime ?? null,
      status: 'awaiting_completion_upload',
    },
  });
});

app.post('/api/jobs/:jobId/photos', (req, res) => {
  const photos = Array.isArray(req.body?.photos) ? (req.body.photos as FinalPhoto[]) : [];

  if (photos.length === 0) {
    res.status(400).json({ error: 'photos array is required' });
    return;
  }

  const record = addFinalJobPhotos(req.params.jobId, photos);

  if (!record) {
    res.status(404).json({ error: 'Job not found' });
    return;
  }

  res.status(201).json(record);
});

app.post('/api/jobs/:jobId/submit', async (req, res) => {
  const submittedAt = Number(req.body?.submittedAt ?? Date.now());
  const endTime = req.body?.endTime ? Number(req.body.endTime) : undefined;
  const completionNote =
    typeof req.body?.completionNote === 'string' ? req.body.completionNote.trim() : undefined;
  const photos = Array.isArray(req.body?.photos) ? (req.body.photos as FinalPhoto[]) : [];
  const record = submitJob(req.params.jobId, {
    completionNote,
    endTime,
    photos,
    submittedAt,
  });

  if (!record) {
    res.status(404).json({ error: 'Job not found' });
    return;
  }

  await new Promise((resolve) => setTimeout(resolve, 300));

  res.json({
    ok: true,
    duration:
      record.activity.startTime && record.activity.endTime
        ? record.activity.endTime - record.activity.startTime
        : 0,
    endTime: record.activity.endTime ?? null,
    finalPhotos: record.activity.finalPhotos,
    jobId: record.job.id,
    completionNote: record.activity.completionNote,
    startTime: record.activity.startTime ?? null,
    submittedAt,
  });
});

app.use('/api', (_req, res) => {
  res.status(404).json({
    error: 'API route not found',
  });
});

app.use((req, res) => {
  res.status(404).json({
    error: 'Route not found',
    path: req.originalUrl,
    message: 'Use / or /api for backend status, and /api/* for data routes.',
  });
});

app.listen(port, () => {
  // eslint-disable-next-line no-console
  console.log(`LogSnap backend listening on http://localhost:${port}`);
});
