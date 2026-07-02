# Developer Guide

- Backend: `cd backend && npm install && npm run db:sync && npm run dev`.
- Frontend: `cd frontend && npm install && npm run dev`.
- Tests: `npm test` from either `backend/` or `frontend/`.
- Keep new backend features in model/service/controller/route order.
- Do not reintroduce `constants/demoData` into production pages.
