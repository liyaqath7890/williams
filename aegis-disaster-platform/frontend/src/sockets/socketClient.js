import { io } from 'socket.io-client';
import { SOCKET_EVENTS } from './socketEvents';

function trimTrailingSlash(value) {
  return value ? value.replace(/\/+$/, '') : value;
}

const socketUrl = import.meta.env.DEV
  ? 'http://localhost:5000'
  : (trimTrailingSlash(import.meta.env.VITE_SOCKET_URL) || trimTrailingSlash(window.location.origin));

export const socket = io(socketUrl, {
  autoConnect: false,
  transports: ['websocket'],
  reconnection: true,
  reconnectionAttempts: Infinity,
  reconnectionDelay: 500,
  reconnectionDelayMax: 5000
});

const offlineQueue = [];

export function connectSocket(token, user) {
  if (socket.connected) return;
  socket.auth = { token, name: user?.name };
  socket.connect();
}

socket.on('connect', () => {
  if (offlineQueue.length) {
    const events = offlineQueue.splice(0, offlineQueue.length);
    socket.emit(SOCKET_EVENTS.OFFLINE_QUEUE_FLUSH, { events });
    events.forEach(({ event, payload }) => socket.emit(event, payload));
  }
});

export function emitRealtime(event, payload) {
  if (socket.connected) {
    socket.emit(event, payload);
    return;
  }
  offlineQueue.push({ event, payload, queuedAt: new Date().toISOString() });
}

export function disconnectSocket() {
  socket.disconnect();
}
