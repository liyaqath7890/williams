import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { authService } from '../../../services/authService';

const TOKEN_KEY = 'aegis_access_token';
const DEMO_TOKEN = 'aegis-demo-token';

export const login = createAsyncThunk('auth/login', async (payload, { rejectWithValue }) => {
  try {
    console.log('Attempting login with:', payload.email);
    const response = await authService.login(payload);
    console.log('Login response received:', response.data);
    return response.data.data;
  } catch (error) {
    console.error('Login error:', error.response?.data || error.message);
    return rejectWithValue(error.response?.data?.message || 'Login failed');
  }
});

export const register = createAsyncThunk('auth/register', async (payload, { rejectWithValue }) => {
  try {
    console.log('Attempting register for:', payload.email);
    const response = await authService.register(payload);
    console.log('Register response received:', response.data);
    return response.data.data;
  } catch (error) {
    console.error('Register error:', error.response?.data || error.message);
    return rejectWithValue(error.response?.data?.message || 'Registration failed');
  }
});

export const fetchCurrentUser = createAsyncThunk('auth/me', async (_, { rejectWithValue }) => {
  try {
    const response = await authService.me();
    return response.data.data;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'Session lookup failed');
  }
});

export const refreshSession = createAsyncThunk('auth/refresh', async (_, { rejectWithValue }) => {
  try {
    const response = await authService.refresh();
    return response.data.data;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'Session refresh failed');
  }
});

export const logout = createAsyncThunk('auth/logout', async () => {
  try {
    await authService.logout();
  } finally {
    localStorage.removeItem(TOKEN_KEY);
  }
});

const initialState = {
  user: null,
  accessToken: localStorage.getItem(TOKEN_KEY),
  status: 'idle',
  bootstrapped: false,
  error: null
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    demoLogin: (state, action) => {
      state.user = action.payload;
      state.accessToken = DEMO_TOKEN;
      state.status = 'authenticated';
      state.bootstrapped = true;
      state.error = null;
      localStorage.setItem(TOKEN_KEY, DEMO_TOKEN);
    },
    clearAuthError: (state) => {
      state.error = null;
    },
    setBootstrapped: (state, action) => {
      state.bootstrapped = action.payload;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(login.pending, markPending)
      .addCase(register.pending, markPending)
      .addCase(fetchCurrentUser.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(refreshSession.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(login.fulfilled, applyCredentials)
      .addCase(register.fulfilled, applyCredentials)
      .addCase(refreshSession.fulfilled, applyCredentials)
      .addCase(fetchCurrentUser.fulfilled, (state, action) => {
        state.user = action.payload.user;
        state.status = 'authenticated';
        state.bootstrapped = true;
      })
      .addCase(logout.fulfilled, clearCredentials)
      .addCase(login.rejected, markRejected)
      .addCase(register.rejected, markRejected)
      .addCase(fetchCurrentUser.rejected, clearCredentials)
      .addCase(refreshSession.rejected, clearCredentials);
  }
});

function markPending(state) {
  state.status = 'loading';
  state.error = null;
}

function applyCredentials(state, action) {
  state.user = action.payload.user;
  state.accessToken = action.payload.accessToken;
  state.status = 'authenticated';
  state.bootstrapped = true;
  state.error = null;
  localStorage.setItem(TOKEN_KEY, action.payload.accessToken);
}

function markRejected(state, action) {
  state.status = 'error';
  state.error = action.payload || 'Authentication failed';
  state.bootstrapped = true;
}

function clearCredentials(state) {
  state.user = null;
  state.accessToken = null;
  state.status = 'idle';
  state.bootstrapped = true;
  localStorage.removeItem(TOKEN_KEY);
}

export const { clearAuthError, demoLogin, setBootstrapped } = authSlice.actions;
export default authSlice.reducer;
