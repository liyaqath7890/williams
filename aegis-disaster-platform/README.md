# Aegis - Disaster Help and Rescue Management Platform

Aegis is a production-oriented full-stack disaster response platform scaffold for coordinating victims, authorities, helpers, shelters, alerts, resources, maps, and real-time rescue operations.

## Apps

- `frontend/` - React + Vite client with Tailwind CSS, Redux Toolkit, React Router, Leaflet maps, Socket.IO client, Firebase notification setup, and future-ready AI/drone/WebRTC modules.
- `backend/` - Node.js + Express API with PostgreSQL/Sequelize, JWT auth, Socket.IO, Cloudinary/Multer upload plumbing, Redis cache helpers, analytics, AI, drone, and notification services.

## Quick Start

Start local infrastructure:

```bash
docker compose up -d
```

If you already have PostgreSQL installed locally, set your real connection string in `backend/.env`:

```env
DATABASE_URL=postgres://postgres:your-password@localhost:5432/aegis
```

Then prepare tables and demo records:

```bash
cd backend
npm run db:check
npm run db:setup
```

```bash
cd aegis-disaster-platform/backend
npm install
npm run dev
```

```bash
cd aegis-disaster-platform/frontend
npm install
npm run dev
```

On Windows PowerShell, create environment files with:

```powershell
Copy-Item backend/.env.example backend/.env
Copy-Item frontend/.env.example frontend/.env
```

## Architecture

The project separates UI, API, real-time events, and domain modules so each disaster-management feature can grow independently. API routes are versioned under `/api/v1`, dashboards are role-oriented, and shared concerns such as auth, sockets, uploads, maps, analytics, notifications, and PostgreSQL models have dedicated folders from day one.

## Suggested Build Order

1. Authentication and role-based protected routes. Completed foundation: JWT access tokens, refresh-token sessions, PostgreSQL users/sessions, Redux auth thunks, login/register UI, and guarded dashboards.
2. Dashboard system. Completed foundation: responsive role-aware sidebar/navbar shell, notification panel, upgraded statistics cards, mission timeline, resource snapshot, and distinct victim/authority/helper dashboards.
3. SOS incident lifecycle with real-time authority notifications. Completed foundation: SOS form, browser/simulated location sharing, siren simulation, emergency overlay, API integration, Socket.IO authority broadcasts, Redux live incident queue, and dashboard notification feed.
4. Real-time chat system. Completed foundation: PostgreSQL chat rooms/messages, room history API, Socket.IO room joins, persisted messages, online users, typing indicators, timestamps, and multi-room frontend console.
5. Maps, live tracking, shelters, and resources. Completed foundation: Leaflet markers, danger zones, safe route overlay, shelter cards, resource table, and helper tracking simulation data.
6. Missing-person tracking and emergency alerts. Completed foundation: missing-person registry UI/API, emergency alert composer, severity feed, and real-time Redux notification path.
7. Analytics dashboards and simulation modules. Completed foundation: Recharts analytics, AI risk simulation, drone mission API, resource mix, and incident trend charts.
8. Firebase Cloud Messaging, Cloudinary uploads, Redis caching, WebRTC, and AI integrations. Completed foundation: config placeholders, upload API, Redis cache helpers, WebRTC client helper, Dockerfiles, production env template, and security headers.
9. Product completion pass. Completed foundation: dedicated AI simulation screen, drone telemetry screen, upload center, dashboard navigation for advanced modules, panic-keyword API, and full build verification.
