# ReachInbox — Full-Stack Email Job Scheduler

A full-stack, production-ready cold email campaign scheduler and real-time monitoring dashboard built for the **ReachInbox.ai Software Development Intern Assignment**.

This project provides a reliable way to schedule cold email campaigns at scale with inter-email delays, per-sender hourly rate limits, concurrency controls, idempotency guards, and full persistence across server restarts — **without relying on cron jobs**.

---

## Project Structure

```text
reachinbox-email-scheduler/
│
├── backend/
│   ├── prisma/               # PostgreSQL schema & migrations
│   └── src/
│       ├── config/           # Redis, Prisma & environment config
│       ├── controllers/      # Auth, Sender, & Schedule API controllers
│       ├── middleware/       # JWT authentication & session middleware
│       ├── queues/           # BullMQ delayed job queue definition
│       ├── routes/           # Express REST API endpoint routing
│       ├── services/         # Core business logic & db query services
│       └── workers/          # BullMQ worker thread engine & Nodemailer
│
├── frontend/
│   └── src/
│       ├── components/       # Header, Cards, Tables & Modal components
│       ├── services/         # Axios API service layer with JWT credentials
│       └── types/            # TypeScript interface definitions
│
├── docker-compose.yml        # Docker configuration for PostgreSQL & Redis
└── README.md                 # Documentation & Architecture guide
```

---

## What We Have Built

We built a full-stack, decoupled system that allows marketers and sales teams to upload email lead lists, schedule staggered cold outreach sequences, and inspect delivery statuses live.

### Core Features

1. **Google OAuth 2.0 & Session Management**:
   - Authenticates users via Google OAuth 2.0.
   - Verifies tokens on the Express backend and issues secure, HttpOnly JWT cookies.
   - Automatically provisions user profiles in PostgreSQL.

2. **Multiple SMTP Senders Management**:
   - Support for adding and managing multiple SMTP accounts (`POST /api/senders`, `GET /api/senders`).
   - Built-in **⚡ Auto-fill Demo Ethereal** button that automatically provisions real Ethereal SMTP test mailboxes on-the-fly for quick code reviews.

3. **Campaign Composition & CSV Lead Parser**:
   - Modal interface to set campaign Subject, Body, Start Time, Inter-email Delay (sec), and Hourly Rate Limit.
   - Built-in lead parser accepting copy-pasted raw text or uploaded `.csv`/`.txt` files, extracting valid emails using regex and filtering duplicates.

4. **Event-Driven BullMQ Queue (No Cron)**:
   - Eliminates database polling by using Redis-backed BullMQ delayed jobs (`{ delay: delayMs }`).
   - Calculates exact staggered dispatch timestamps for every recipient lead.

5. **Worker Execution Engine**:
   - Runs as an independent worker process (`npm run worker`) with configurable thread concurrency (`WORKER_CONCURRENCY`).
   - Executes Nodemailer SMTP calls and updates delivery logs in real time.

6. **Idempotency Guard & Server Restart Safety**:
   - Before dispatching any email, the worker checks PostgreSQL status (`status === "SENT"`).
   - If the server or worker crashes and restarts mid-campaign, BullMQ re-delivers pending jobs, but PostgreSQL idempotency guarantees zero duplicate emails are ever sent.

7. **Hourly Rate Limiting**:
   - Tracks emails sent per sender using atomic Redis counters (`sender:{id}:hour:{window}`).
   - If a sender exceeds their hourly limit, the worker calls `job.moveToDelayed()` to cleanly push excess jobs into the next hour window without dropping jobs or losing queue order.

8. **Live Monitoring Dashboard**:
   - Modern light cream theme UI showing live metric summary cards (Total Campaigns, Pending Jobs, Successfully Sent, Failed).
   - Expandable campaign cards showing recipient status breakdowns (`Scheduled`, `Processing`, `Completed`, `Sent`).
   - Clicking on **any recipient email row** opens a modal displaying the exact **Subject line**, **Full Email Body text**, **Sender info**, and **Delivery status**.

---

## How The Application Actually Works (Step-by-Step Flow)

```text
 [1. User Logs In] ──► Google OAuth ──► JWT Cookie ──► PostgreSQL User Record Saved
                                                            │
 [2. Add Sender]   ──► Add SMTP Senders (Ethereal / Gmail) ──► PostgreSQL Sender Saved
                                                            │
 [3. Create Campaign] ──► Compose Subject + Body + Upload CSV Leads List
                                                            │
                                                            ▼
                 [Backend calculates staggered delay timestamps]
                 scheduledAt = startTime + (index * delaySeconds * 1000)
                                                            │
                                  ┌─────────────────────────┴─────────────────────────┐
                                  ▼                                                   ▼
                    [Save Schedule & Emails in PostgreSQL]             [Enqueue Delayed Jobs in BullMQ Queue]
                                                                                      │
                                                                                      ▼
                                                                     [BullMQ Worker Waits in Redis]
                                                                                      │
                                                                     (Delay Timer Expires -> Job Fires)
                                                                                      │
                                                                                      ▼
                                                                     [1. Check Idempotency in PostgreSQL]
                                                                     [2. Check Hourly Counter in Redis]
                                                                                      │
                                                                                      ▼
                                                                     [3. Dispatch via Nodemailer SMTP]
                                                                                      │
                                                                                      ▼
                                                                     [4. Update Email Status to "SENT"]
```

### Step 1: User Log In & Authentication
- The user opens `http://localhost:5173` and clicks **Sign in with Google**.
- Frontend passes the Google token to `POST /api/auth/google`.
- Backend verifies the user, saves them in PostgreSQL, generates a JWT token, and returns it inside an `HttpOnly` cookie.

### Step 2: Configure Sender Account
- User opens **SMTP Senders** and clicks **⚡ Auto-fill Demo Ethereal**.
- Credentials are saved in PostgreSQL under the user's account ID.

### Step 3: Schedule a Campaign
- User clicks **+ New Campaign**, selects a sender, enters Subject, Body, sets Delay (e.g. `2` seconds), and pastes lead emails (`john@example.com`, `alice@example.com`).
- The backend computes staggered timestamps:
  - Lead 1: `scheduledAt = startTime + (0 * 2000)`
  - Lead 2: `scheduledAt = startTime + (1 * 2000)`
- The backend creates the `Schedule` parent and `ScheduledEmail` child rows in PostgreSQL with status `SCHEDULED`, then enqueues delayed jobs into BullMQ with `{ delay: delayMs }`.

### Step 4: Worker Queue Processing & Dispatch
- The worker engine (`npm run worker`) listens to the `email-scheduler` queue in Redis.
- As each job's delay timer expires, BullMQ executes the job:
  1. **Idempotency Check**: Worker queries PostgreSQL. If `status === "SENT"`, it skips.
  2. **Rate Limit Check**: Worker increments Redis key `sender:{id}:hour:{window}`. If `count > hourlyLimit`, it calls `job.moveToDelayed()` to postpone the job to the next hour.
  3. **Nodemailer Call**: Worker dispatches the email via SMTP.
  4. **DB Update**: Worker sets `status = "SENT"` and `sentAt = new Date()`.
  5. **Completion Check**: When all child emails finish, the parent schedule status updates to `COMPLETED`.

### Step 5: Dashboard Monitoring & Inspection
- The dashboard silently polls the API every 10 seconds to update live counts.
- Clicking any recipient email in either table pops up the **Email Details Modal** displaying full email contents.

---

## Tech Stack Summary

* **Backend**: Node.js, Express.js, TypeScript, PostgreSQL (Prisma ORM), BullMQ, Redis (`ioredis`), Nodemailer, JWT.
* **Frontend**: React.js (Vite), TypeScript, Tailwind CSS, Lucide React Icons, `@react-oauth/google`.
* **Infrastructure**: Docker & Docker Compose.

---

## Environment Variables

### Backend (`backend/.env`)
```env
PORT=5000
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/email_scheduler?schema=public"
REDIS_HOST="localhost"
REDIS_PORT=6379
JWT_SECRET="reachinbox_super_secret_jwt_key_2026"
GOOGLE_CLIENT_ID="YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com"
WORKER_CONCURRENCY=5
```

### Frontend (`frontend/.env`)
```env
VITE_GOOGLE_CLIENT_ID="YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com"
```

---

## How To Run Locally

### 1. Start Infrastructure via Docker
```bash
docker compose up -d
```

### 2. Start Backend API Server
```bash
cd backend
npm install
npx prisma db push
npm run dev
```

### 3. Start Worker Engine
In a new terminal window:
```bash
cd backend
npm run worker
```

### 4. Start Frontend React Dashboard
In a third terminal window:
```bash
cd frontend
npm install
npm run dev
```
Open `http://localhost:5173` in your browser.

---

## Technical Trade-offs

1. **BullMQ Delayed Jobs vs. Cron Polling**: Delayed jobs in Redis eliminate heavy SQL polling queries (`SELECT * WHERE scheduledAt <= NOW()`), giving millisecond-accurate job execution.
2. **Atomic Redis Counters vs. Database Counting**: Hourly rate limits use atomic Redis keys with TTLs instead of expensive SQL `COUNT(*)` queries.
3. **Database Idempotency**: Checking PostgreSQL status before sending network SMTP requests guarantees zero duplicate email dispatches.

---

## Submission Details

* **Author**: Yashas
* **Assignment**: Full-stack Email Job Scheduler (ReachInbox.ai / Outbox Labs)
* **Access Granted To**: `Mitrajit` and `Yadav036`
