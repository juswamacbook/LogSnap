# LogSnap

LogSnap is a mobile-first job logging assistant built for field workers (electricians, fire protection, technicians). It focuses on **passive job tracking and simple proof-of-work reports**, reducing manual input and allowing workers to focus on the job instead of paperwork.

---

## 🚀 Overview

Field workers often spend unnecessary time manually logging:
- Start and end times  
- Job details  
- Photos of completed work  

LogSnap simplifies this into a **low-friction workflow**:

> Tap once to start → do the work → tap once to finish → generate a report

It is **not a replacement for tools like Jobber**, but a lightweight layer that makes reporting faster and easier.

---

## ✨ Key Features

### ▶️ One-Tap Job Tracking
- Start a job with a single tap  
- Automatically logs:
  - Start time  
  - Location (if enabled)  
  - Job reference  

---

### ⏱️ Passive Work Session
- Runs a live timer in the background  
- Minimal interaction required during the job  
- Keeps the experience lightweight and distraction-free  

---

### 📸 Final Proof-of-Work Photos
- Capture **1–3 photos after completing the job**  
- Photos are timestamped and attached to the report  
- Removes unnecessary before/during photo friction  

---

### 🎤 Voice Notes (Optional)
- Record quick voice notes during or after a job  
- Supports fast, natural input without typing  
- Can be included in the final report  

---

### 📝 Simple Report Generation
- Automatically generates a structured report including:
  - Start time  
  - End time  
  - Duration  
  - Location  
  - Final photos  
  - Optional notes / voice input  

- Designed to be easily submitted to platforms like Jobber  

---

### 📤 Submit to Jobber (Workflow Integration)
- Dedicated submission screen  
- Prepares job data for external tools  
- Maintains compatibility with existing workflows  

---

### 📍 Smart Job Detection (Planned / Optional)
- Detect when a worker is near a job site (~50–100m radius)  
- Trigger a notification when a scheduled job is nearby  
- Helps reduce missed or forgotten job logs  

---

## 🧠 How It Works

### Current Workflow (Without LogSnap)
1. Arrive at job site  
2. Open Jobber  
3. Enter start time  
4. Take photos manually  
5. Write description  
6. Enter end time  
7. Submit report  

---

### LogSnap Workflow
1. Open job and tap **Start Job**  
2. Work normally (timer runs in background)  
3. Tap **Finish Job**  
4. Add final photos (and optional notes)  
5. Generate report  
6. Submit to Jobber  

---

## 🛠️ Tech Stack (MVP)

### Frontend
- React Native (Expo)  
- TypeScript  

### Backend
- Node.js + Express  
- REST API  

### Database (Planned)
- PostgreSQL or MySQL  

### Services
- GPS / Geofencing APIs  
- Cloud Storage (AWS S3 / Supabase)  
- Push Notifications (Firebase)  

---

## 📦 Project Structure
LogSnap/
├── mobile/ # React Native app
├── backend/ # Express API server
├── database/ # Schema & migrations (planned)
├── docs/ # Product + design notes
├── src/
│ ├── backend/ # In-memory backend (MVP)
│ │ ├── server.ts
│ │ ├── store.ts
│ │ └── types.ts
│ └── frontend/
│ ├── ActiveJobScreen.tsx
│ ├── JobDetailScreen.tsx
│ ├── JobsListScreen.tsx
│ ├── PhotoCaptureScreen.tsx
│ └── SuccessScreen.tsx
├── App.tsx
├── index.js
└── package.json


---

## 🔧 Setup (Development)

### 1. Install dependencies
```bash
npm install

### 2. Run the App
npm start

Clear cache if needed:
npx expo start --clear

###3. Run Backend
npm run backend

Watch mode:
npm run backend:dev

API Base URL
http://localhost:4000

Health Check
curl http://localhost:4000/api/health

🔌 API Endpoints
GET /api/health
GET /api/jobs
GET /api/jobs/:jobId
POST /api/jobs/:jobId/start
POST /api/jobs/:jobId/note
POST /api/jobs/:jobId/finish
POST /api/jobs/:jobId/photos
POST /api/jobs/:jobId/submit

🧪 MVP Notes
Frontend currently uses mock data and local session state
Backend uses an in-memory store (no persistent database yet)
Screens are connected through a shared session workflow
Reports are template-based (not AI-generated yet)
Final photos are handled as a post-completion step only

⚠️ Design Considerations
Low friction first: minimize required inputs
User control: manual overrides always available
Battery usage: optimize location tracking
Privacy: only track location during active jobs
Reliability: ensure photos, notes, and sessions are not lost

🎯 Vision

LogSnap is designed to:

Remove friction from job reporting so workers can focus on the work itself.

It complements existing tools by making job logging:

faster
simpler
more consistent

📌 Future Improvements
Direct Jobber API integration
Voice-to-text summaries
AI-generated reports
Offline mode
Supervisor dashboards
Smart automation (location + schedule-based triggers)

👤 Author

Joshua Ranin
Queen’s University — Computer Science
Aspiring Software Engineer / Builder

