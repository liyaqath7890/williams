import { Outlet } from 'react-router-dom';
import { useEffect, useState } from 'react';
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
  const [toasts, setToasts] = useState([]);

  const addToast = (toast) => {
    const id = Date.now().toString();
    setToasts((prev) => [...prev, { ...toast, id }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 5000);
  };

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
      addToast({
        title: 'Emergency Alert',
        message: alert.title || alert.message,
        type: 'danger'
      });
    };

    const handleNotificationCreated = (notification) => {
      dispatch(
        pushAlert({
          id: notification.id || `notification-${Date.now()}`,
          title: notification.title || 'Notification',
          message: notification.body || notification.detail || 'New notification received.',
          severity: notification.severity || 'info',
          createdAt: new Date().toISOString()
        })
      );
      addToast({
        title: 'New Notification',
        message: notification.title || notification.body || notification.detail,
        type: 'info'
      });
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
    socket.on(SOCKET_EVENTS.NOTIFICATION_CREATED, handleNotificationCreated);
    socket.on(SOCKET_EVENTS.ALERT_DELETED, handleAlertDeleted);
    socket.on(SOCKET_EVENTS.ASSIGNMENT_CHANGED, handleAssignmentChanged);
    socket.on(SOCKET_EVENTS.CHAT_MESSAGE, (message) => dispatch(addMessage(message)));
    socket.on(SOCKET_EVENTS.CHAT_ROOM_USERS, (payload) => dispatch(setRoomUsers(payload)));
    socket.on(SOCKET_EVENTS.CHAT_TYPING, (payload) => dispatch(setTypingUser(payload)));
    socket.on(SOCKET_EVENTS.CHAT_STOP_TYPING, (payload) => dispatch(removeTypingUser(payload)));

    return () => {
      socket.off(SOCKET_EVENTS.SOS_CREATED, handleSosCreated);
      socket.off(SOCKET_EVENTS.ALERT_BROADCAST, handleAlertBroadcast);
      socket.off(SOCKET_EVENTS.NOTIFICATION_CREATED, handleNotificationCreated);
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
      {/* Global Toast Container */}
      <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 max-w-sm pointer-events-none">
        {toasts.map((toast) => (
          <div 
            key={toast.id} 
            className={`pointer-events-auto shadow-lg rounded-lg p-4 transition-all transform animate-in slide-in-from-top-2 fade-in duration-300 border-l-4 bg-white
              ${toast.type === 'danger' ? 'border-red-500' : 'border-blue-500'}`}
          >
            <h4 className={`font-bold text-sm ${toast.type === 'danger' ? 'text-red-700' : 'text-blue-700'}`}>
              {toast.title}
            </h4>
            <p className="text-slate-600 text-xs mt-1">{toast.message}</p>
          </div>
        ))}
      </div>
    </>
  );
}
