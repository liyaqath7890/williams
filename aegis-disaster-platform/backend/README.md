# Aegis Backend

Express + PostgreSQL API for disaster response workflows.

## Folder Purpose

- `controllers/` - HTTP request handlers organized by API version.
- `routes/` - Versioned Express route modules.
- `models/` - Sequelize models and associations for users, incidents, shelters, resources, and reports.
- `middleware/` - Auth, error handling, upload, validation, and request guards.
- `services/` - Business logic that controllers call.
- `validations/` - Zod schemas for request validation.
- `sockets/` - Socket.IO event registration and authentication.
- `ai/`, `drone/`, `analytics/`, `notifications/`, `cache/` - Specialized platform capabilities.
- `config/` - Environment, database, cloud, and service clients.
- `utils/` and `helpers/` - Shared response, token, async, and formatting helpers.
- `uploads/` and `logs/` - Runtime storage placeholders.

## Commands

```bash
npm install
cp .env.example .env
npm run dev
npm start
```

## PostgreSQL Setup

Create a local database named `aegis`, then set `DATABASE_URL` in `.env`. The root `docker-compose.yml` can start PostgreSQL and Redis for local development.

```bash
docker compose up -d
```

During Phase 1, `DB_SYNC=true` allows Sequelize to create starter tables automatically in development. Use migrations before production deployment.

Database utility scripts:

```bash
npm run db:check
npm run db:sync
npm run db:seed
npm run db:setup
```

Seeded demo users use `Password123!`:

- `victim@aegis.local`
- `helper@aegis.local`
- `authority@aegis.local`
- `admin@aegis.local`

## Authentication

The Phase 2 auth foundation includes:

- `POST /api/v1/auth/register`
- `POST /api/v1/auth/login`
- `POST /api/v1/auth/refresh`
- `POST /api/v1/auth/logout`
- `GET /api/v1/auth/me`

Access tokens are returned to the client for API authorization. Refresh tokens are stored in httpOnly cookies and tracked in the `sessions` table so logout and rotation can revoke sessions cleanly.

## Chat

Phase 5 includes persistent chat foundations:

- `GET /api/v1/chat/rooms`
- `GET /api/v1/chat/rooms/:roomId/messages`
- Socket.IO `chat:join-room`
- Socket.IO `chat:message`
- Socket.IO `chat:typing`
- Socket.IO `chat:stop-typing`
- Socket.IO `chat:room-users`

## Operations APIs

- `GET /api/v1/shelters`
- `POST /api/v1/shelters`
- `PATCH /api/v1/shelters/:id`
- `GET /api/v1/resources`
- `POST /api/v1/resources`
- `PATCH /api/v1/resources/:id`
- `GET /api/v1/missing-persons`
- `POST /api/v1/missing-persons`
- `PATCH /api/v1/missing-persons/:id/status`
- `GET /api/v1/analytics`
- `GET /api/v1/ai/predictions`
- `POST /api/v1/ai/panic-detection`
- `GET /api/v1/drone`
- `POST /api/v1/uploads/single`
