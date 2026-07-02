import { Router } from 'express';
import { broadcastNotification, getNotifications, readNotification, removeNotification, saveNotificationPreferences } from '../../controllers/v1/notification.controller.js';
import { allowRoles, requireAuth } from '../../middleware/authMiddleware.js';

export const notificationRouter = Router();

notificationRouter.use(requireAuth);
notificationRouter.get('/', getNotifications);
notificationRouter.patch('/preferences', saveNotificationPreferences);
notificationRouter.post('/broadcast', allowRoles('admin', 'authority'), broadcastNotification);
notificationRouter.patch('/:id/read', readNotification);
notificationRouter.delete('/:id', removeNotification);
