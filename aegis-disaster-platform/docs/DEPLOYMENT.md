# Deployment Guide

1. Provision PostgreSQL and set `DATABASE_URL`.
2. Configure Cloudinary: `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`.
3. Configure auth: `JWT_SECRET`, `JWT_REFRESH_SECRET`, `CLIENT_ORIGIN`.
4. Optional push notifications: `FIREBASE_SERVER_KEY`.
5. Run backend database sync with `npm run db:sync` from `backend/`.
6. Build frontend with `npm run build` from `frontend/`.
7. Run backend with `npm start` and serve frontend `dist/` behind HTTPS.
8. Verify `/health`, login, reports, uploads, and socket events.
