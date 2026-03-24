# LogSnap

LogSnap is a mobile-first job logging assistant designed for field workers (electricians, fire protection, technicians). It simplifies job reporting by automatically capturing timestamps, location, and job activity, reducing manual input and improving accuracy.

## 🚀 Overview

Field workers often spend extra time manually logging:
- Start and end times  
- Job descriptions  
- Photos of work completed  

LogSnap streamlines this by turning job logging into a one-tap workflow, with optional automation based on location and time.

## ✨ Key Features

### 📍 Smart Job Detection
- Detects when a worker is near a job site (~50–100m radius)
- Triggers a notification when a scheduled job is nearby
- Prevents accidental triggers if not within range

### ▶️ One-Tap Job Start
- "Start Job" button when arriving on site
- Automatically logs:
  - Start time
  - Location
  - Job reference

### 📸 Automatic Activity Logging
- Capture photos during the job
- Each photo is automatically timestamped and attached to the report
- Reduces need for manual notes

### ⏱️ Job Completion Tracking
- "Complete Job" button to finish session
- Logs:
  - End time
  - Duration
  - Completion status

### 📝 Report Generation
- Auto-generates a structured job report including:
  - Timeline (start → end)
  - Photos
  - Notes (optional)
- Ready for submission to platforms like Jobber

### 🔔 Notifications (Optional)
- Job start reminders
- Missed job alerts
- Progress check-ins

## 🧠 How It Works

### Current Workflow (Without LogSnap)
1. Arrive at job site  
2. Manually open Jobber  
3. Enter start time  
4. Take photos manually  
5. Write description  
6. Enter end time  
7. Submit report  

### LogSnap Workflow
1. Worker approaches job site  
2. Receives notification: "You're near your job"  
3. Taps **Start Job**  
4. Works normally (photos auto-logged)  
5. Taps **Complete Job**  
6. Report is generated automatically  

## 🛠️ Tech Stack (MVP)

**Frontend**
- React Native (Expo)
- TypeScript

**Backend**
- Node.js + Express
- REST API

**Database**
- PostgreSQL (or MySQL for early MVP)

**Services**
- GPS / Geofencing APIs
- Cloud Storage (AWS S3 / Supabase)
- Push Notifications (Firebase)

## 📦 Project Structure
