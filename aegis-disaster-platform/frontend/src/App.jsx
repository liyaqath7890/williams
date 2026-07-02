import { Outlet } from 'react-router-dom';
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchCurrentUser, refreshSession, setBootstrapped } from './redux/features/auth/authSlice';
import { pushAlert, removeAlert } from './redux/features/alerts/alertsSlice';
import { addMessage, removeTypingUser, setRoomUsers, setTypingUser } from './redux/features/chat/chatSlice';
import { addIncident, updateIncident } from './redux/features/sos/sosSlice';
import { connectSocket, disconnectSocket, socket } from './sockets/socketClient';
import { SOCKET_EVENTS } from './sockets/socketEvents';
import ChatbotPanel from './components/ai/ChatbotPanel';

export default function App() {
  const dispatch = useDispatch();
  const { accessToken, bootstrapped, user } = useSelector((state) => state.auth);

  useEffect(() => {
    if (bootstrapped) return;

    if (accessToken === 'aegis-demo-token') {
      dispatch(setBootstrapped(true));
      return;
    }

    if (accessToken) {
      dispatch(fetchCurrentUser());
      return;
    }

    // If refresh fails (e.g., cookie blocked in some deployments), avoid an infinite redirect loop.
    dispatch(refreshSession()).unwrap().catch(() => {
      dispatch(setBootstrapped(true));
    });
  }, [accessToken, bootstrapped, dispatch]);

  useEffect(() => {
    if (!accessToken || !user) {
      disconnectSocket();
      return;
    }

    connectSocket(accessToken, user);

    const handleSosCreated = (incident) => {
      dispatch(addIncident(incident));
      dispatch(
        pushAlert({
          id: incident.id,
          title: 'Live SOS alert',
          message: `${incident.disasterType} request received near ${incident.location?.address || 'shared location'}.`,
          severity: incident.severity || 'critical',
          createdAt: new Date().toISOString()
        })
      );
    };

    const handleAlertBroadcast = (alert) => {
      dispatch(pushAlert(alert));
    };

    const handleAlertDeleted = ({ id }) => {
      dispatch(removeAlert(id));
    };

    const handleAssignmentChanged = (incident) => {
      dispatch(updateIncident(incident));
      dispatch(
        pushAlert({
          id: `${incident.id}-${incident.status}`,
          title: `SOS Update: ${incident.disasterType}`,
          message: `Rescue status updated to ${incident.status}.`,
          severity: 'info',
          createdAt: new Date().toISOString()
        })
      );
    };

    socket.on(SOCKET_EVENTS.SOS_CREATED, handleSosCreated);
    socket.on(SOCKET_EVENTS.ALERT_BROADCAST, handleAlertBroadcast);
    socket.on(SOCKET_EVENTS.ALERT_DELETED, handleAlertDeleted);
    socket.on(SOCKET_EVENTS.ASSIGNMENT_CHANGED, handleAssignmentChanged);
    socket.on(SOCKET_EVENTS.CHAT_MESSAGE, (message) => dispatch(addMessage(message)));
    socket.on(SOCKET_EVENTS.CHAT_ROOM_USERS, (payload) => dispatch(setRoomUsers(payload)));
    socket.on(SOCKET_EVENTS.CHAT_TYPING, (payload) => dispatch(setTypingUser(payload)));
    socket.on(SOCKET_EVENTS.CHAT_STOP_TYPING, (payload) => dispatch(removeTypingUser(payload)));

    return () => {
      socket.off(SOCKET_EVENTS.SOS_CREATED, handleSosCreated);
      socket.off(SOCKET_EVENTS.ALERT_BROADCAST, handleAlertBroadcast);
      socket.off(SOCKET_EVENTS.ALERT_DELETED, handleAlertDeleted);
      socket.off(SOCKET_EVENTS.ASSIGNMENT_CHANGED, handleAssignmentChanged);
      socket.off(SOCKET_EVENTS.CHAT_MESSAGE);
      socket.off(SOCKET_EVENTS.CHAT_ROOM_USERS);
      socket.off(SOCKET_EVENTS.CHAT_TYPING);
      socket.off(SOCKET_EVENTS.CHAT_STOP_TYPING);
      disconnectSocket();
    };
  }, [accessToken, dispatch, user]);

  return (
    <>
      <Outlet />
      <ChatbotPanel />
    </>
  );
}
