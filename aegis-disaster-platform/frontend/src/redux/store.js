import { configureStore } from '@reduxjs/toolkit';
import authReducer from './features/auth/authSlice';
import sosReducer from './features/sos/sosSlice';
import alertsReducer from './features/alerts/alertsSlice';
import resourcesReducer from './features/resources/resourcesSlice';
import chatReducer from './features/chat/chatSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    sos: sosReducer,
    alerts: alertsReducer,
    resources: resourcesReducer,
    chat: chatReducer
  }
});
