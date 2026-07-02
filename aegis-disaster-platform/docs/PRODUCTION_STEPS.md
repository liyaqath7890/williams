# Production Deployment Steps

1. Set production env vars and secrets.
2. Run `npm ci` in `backend/` and `frontend/`.
3. Run `npm test` in both packages.
4. Run `npm run build` in `frontend/`.
5. Run `npm run db:sync` or managed migrations.
6. Start backend with process supervision.
7. Serve frontend through HTTPS with API/socket proxying.
8. Confirm Cloudinary upload, Firebase push, reports export, alert delete, and realtime updates.
