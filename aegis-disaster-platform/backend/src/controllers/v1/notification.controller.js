import { asyncHandler } from '../../utils/asyncHandler.js';
import { sendSuccess } from '../../utils/apiResponse.js';
import { createBroadcastNotification, deleteNotification, listNotifications, markNotificationRead, updateNotificationPreferences } from '../../services/notification.service.js';

export const getNotifications = asyncHandler(async (req, res) => {
  sendSuccess(res, await listNotifications(req.user.id), 'Notifications loaded');
});

export const readNotification = asyncHandler(async (req, res) => {
  sendSuccess(res, await markNotificationRead(req.user.id, req.params.id), 'Notification marked read');
});

export const removeNotification = asyncHandler(async (req, res) => {
  sendSuccess(res, await deleteNotification(req.user.id, req.params.id), 'Notification deleted');
});

export const saveNotificationPreferences = asyncHandler(async (req, res) => {
  sendSuccess(res, await updateNotificationPreferences(req.user, req.body), 'Notification preferences saved');
});

export const broadcastNotification = asyncHandler(async (req, res) => {
  sendSuccess(res, await createBroadcastNotification(req.body), 'Broadcast notification sent', 201);
});
