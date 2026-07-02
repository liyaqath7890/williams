import { Router } from 'express';
import { exportReport, getReport } from '../../controllers/v1/report.controller.js';
import { requireAuth } from '../../middleware/authMiddleware.js';

export const reportRouter = Router();

reportRouter.use(requireAuth);
reportRouter.get('/', getReport);
reportRouter.get('/export/:format', exportReport);
