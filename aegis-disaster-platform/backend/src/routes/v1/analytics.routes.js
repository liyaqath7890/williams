import { Router } from 'express';
import { getAnalytics } from '../../controllers/v1/analytics.controller.js';
import { allowRoles, requireAuth } from '../../middleware/authMiddleware.js';

export const analyticsRouter = Router();

analyticsRouter.use(requireAuth);
analyticsRouter.get('/', allowRoles('admin', 'authority'), getAnalytics);
