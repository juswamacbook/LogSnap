# LogSnap

LogSnap is an Expo-based React Native app with a small local Express backend for job logging flows.

## Requirements

- Node.js 18+
- npm
- Expo Go or an iOS/Android simulator

## Install

```bash
npm install
```

## Run The App

Start the Expo frontend from the repo root:

```bash
npm start
```

Other frontend commands:

```bash
npm run ios
npm run android
npm run web
```

## Run The Backend

Start the local API:

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

## Run Both

Use two terminals from the repo root.

Terminal 1:

```bash
npm run backend
```

Terminal 2:

```bash
npm start
```

## Available API Endpoints

- `GET /api/health`
- `GET /api/jobs`
- `GET /api/jobs/:jobId`
- `POST /api/jobs/:jobId/start`
- `POST /api/jobs/:jobId/notes`
- `POST /api/jobs/:jobId/photos`
- `PATCH /api/jobs/:jobId/checklist`
- `POST /api/jobs/:jobId/review`
- `POST /api/jobs/:jobId/submit`

## Project Structure

```text
.
├── App.tsx
├── index.js
├── src
│   ├── App.tsx
│   ├── index.js
│   ├── backend
│   │   ├── server.ts
│   │   ├── store.ts
│   │   └── types.ts
│   └── frontend
│       ├── JobsListScreen.tsx
│       ├── JobDetailScreen.tsx
│       ├── ActiveJobScreen.tsx
│       ├── VoiceNoteScreen.tsx
│       ├── PhotoCaptureScreen.tsx
│       ├── ReviewReportScreen.tsx
│       └── SuccessScreen.tsx
└── package.json
```

## Notes

- The frontend currently contains screen implementations and navigation wiring.
- The backend currently uses an in-memory store, not a database.
- If Expo is launched from `src/` by your IDE, the `src/package.json` shim is present to avoid the missing `src/package.json` error.
