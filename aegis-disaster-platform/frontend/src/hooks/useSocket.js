import { useEffect } from 'react';
import { socket } from '../sockets/socketClient';

export function useSocket(eventName, handler) {
  useEffect(() => {
    socket.on(eventName, handler);
    return () => socket.off(eventName, handler);
  }, [eventName, handler]);
}
