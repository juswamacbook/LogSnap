# LogSnap

LogSnap is an app with a small local Express backend for a focused field-worker job flow centered on passive work tracking and simple proof-of-work reports.

## MVP Workflow

1. Open a job and tap `Start Job`
2. Work from a minimal in-progress screen with:
   - running timer
   - task summary
   - lightweight reference context
   - `Finish Job`
3. After finishing, add `1-3` final photos
4. Optionally leave a short completion note
5. Generate a simple work report with:
   - start time
   - end time
   - duration
   - location
   - final photos
   - template-based summary

## Requirements

- Node.js 18+
- npm
- Expo Go or an iOS/Android simulator

## Install

```bash
npm install
```

## Run The App

```bash
npm start
```

Other frontend commands:

```bash
npm run ios
npm run android
npm run web
```

If Metro is holding stale state, use:

```bash
npx expo start --clear
```

## Run The Backend

```bash
npm run backend
```

Watch mode:

```bash
npm run backend:dev
```

Default API base URL:

```text
http://localhost:4000
```

Health check:

```bash
curl http://localhost:4000/api/health
```

## Available API Endpoints

- `GET /api/health`
- `GET /api/jobs`
- `GET /api/jobs/:jobId`
- `POST /api/jobs/:jobId/start`
- `POST /api/jobs/:jobId/note`
- `POST /api/jobs/:jobId/finish`
- `POST /api/jobs/:jobId/photos`
- `POST /api/jobs/:jobId/submit`

## Project Structure

```text
.
├── App.tsx
├── index.js
├── src
│   ├── App.tsx
│   ├── backend
│   │   ├── server.ts
│   │   ├── store.ts
│   │   └── types.ts
│   └── frontend
│       ├── ActiveJobScreen.tsx
│       ├── JobDetailScreen.tsx
│       ├── JobsListScreen.tsx
│       ├── PhotoCaptureScreen.tsx
│       └── SuccessScreen.tsx
└── package.json
```

## Notes

- The frontend currently uses local mock data and mock capture assets for the MVP flow.
- The backend uses an in-memory store, not a database.
- The frontend now uses a shared in-memory session store so the existing screens behave like one connected workflow.
- Final photos are modeled as a post-completion upload step only.
- The generated report is intentionally simple and template-based for the MVP.
