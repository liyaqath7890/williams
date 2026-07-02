import { Notification, User } from '../models/index.js';
import { sendPushNotification } from '../notifications/fcm.service.js';
import { emitNotificationChanged, emitNotificationCreated } from '../sockets/emitters.js';

export function listNotifications(userId) {
  return Notification.findAll({ where: { userId }, order: [['createdAt', 'DESC']] });
}

export async function createNotification(userId, payload) {
  const notification = await Notification.create({ ...payload, userId });
  emitNotificationCreated(notification);
  await sendPushNotification(payload.token, payload.title, payload.body, payload.data).catch(() => null);
  return notification;
}

export async function createBroadcastNotification(payload) {
  const users = await User.findAll({ attributes: ['id'] });
  const notifications = await Promise.all(users.map((user) => createNotification(user.id, payload)));
  return notifications;
}

export async function markNotificationRead(userId, id) {
  const notification = await Notification.findOne({ where: { id, userId } });
  if (!notification) {
    const error = new Error('Notification not found');
    error.statusCode = 404;
    throw error;
  }
  await notification.update({ readAt: new Date() });
  emitNotificationChanged('read', notification);
  return notification;
}

export async function updateNotificationPreferences(user, preferences) {
  const metadata = { ...(user.metadata || {}), notificationPreferences: preferences };
  await user.update({ metadata });
  return metadata.notificationPreferences;
}

export async function deleteNotification(userId, id) {
  const notification = await Notification.findOne({ where: { id, userId } });
  if (!notification) {
    const error = new Error('Notification not found');
    error.statusCode = 404;
    throw error;
  }
  await notification.destroy();
  emitNotificationChanged('deleted', { id });
  return { id };
}
