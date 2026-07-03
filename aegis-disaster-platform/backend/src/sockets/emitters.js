import { SOCKET_EVENTS } from './socketEvents.js';

let socketServer = null;

export function setSocketServer(io) {
  socketServer = io;
}

export function getSocketServer() {
  return socketServer;
}

export function emitSosCreated(incident) {
  socketServer?.to('authorities').to('helpers').emit(SOCKET_EVENTS.SOS_CREATED, incident);
}

export function emitSosUpdated(incident) {
  socketServer?.emit(SOCKET_EVENTS.ASSIGNMENT_CHANGED, incident);
}

export function emitAlertBroadcast(alert) {
  socketServer?.emit(SOCKET_EVENTS.ALERT_BROADCAST, alert);
}

export function emitAlertDeleted(id) {
  socketServer?.emit(SOCKET_EVENTS.ALERT_DELETED, { id });
}

export function emitResourceChanged(action, resource) {
  socketServer?.emit(SOCKET_EVENTS.RESOURCE_CHANGED, { action, resource });
}

export function emitShelterChanged(action, shelter) {
  socketServer?.emit(SOCKET_EVENTS.SHELTER_CHANGED, { action, shelter });
}

export function emitMissingPersonChanged(action, person) {
  socketServer?.emit(SOCKET_EVENTS.MISSING_PERSON_CHANGED, { action, person });
}

export function emitNotificationCreated(notification) {
  socketServer?.to(`user_${notification.userId}`).emit(SOCKET_EVENTS.NOTIFICATION_CREATED, notification);
}

export function emitNotificationChanged(action, notification) {
  socketServer?.to(`user_${notification.userId}`).emit(SOCKET_EVENTS.NOTIFICATION_CHANGED, { action, notification });
}

export function emitTrackingUpdate(payload) {
  socketServer?.to(payload.room || 'tracking').emit(SOCKET_EVENTS.TRACKING_UPDATE, payload);
}
