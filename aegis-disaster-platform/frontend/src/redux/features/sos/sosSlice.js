import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { sosService } from '../../../services/sosService';

export const createSos = createAsyncThunk('sos/create', async (payload, { rejectWithValue }) => {
  try {
    const response = await sosService.createSos(payload);
    return response.data.data;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'Unable to create SOS request');
  }
});

export const fetchSosIncidents = createAsyncThunk('sos/list', async (_, { rejectWithValue }) => {
  try {
    const response = await sosService.listSos();
    return response.data.data;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'Unable to load SOS incidents');
  }
});

export const updateSosIncident = createAsyncThunk('sos/update', async ({ id, payload }, { rejectWithValue }) => {
  try {
    const response = await sosService.updateSos(id, payload);
    return response.data.data;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'Unable to update SOS request');
  }
});

const sosSlice = createSlice({
  name: 'sos',
  initialState: {
    incidents: [],
    activeIncident: null,
    status: 'idle',
    error: null,
    sirenActive: false
  },
  reducers: {
    addIncident: (state, action) => {
      const exists = state.incidents.some((incident) => incident.id === action.payload.id);
      if (!exists) {
        state.incidents.unshift(action.payload);
      }
    },
    updateIncident: (state, action) => {
      const idx = state.incidents.findIndex((i) => i.id === action.payload.id);
      if (idx !== -1) {
        state.incidents[idx] = action.payload;
      }
      if (state.activeIncident?.id === action.payload.id) {
        state.activeIncident = action.payload;
      }
    },
    setIncidents: (state, action) => {
      state.incidents = action.payload;
    },
    setSirenActive: (state, action) => {
      state.sirenActive = action.payload;
    },
    clearSosError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(createSos.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(createSos.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.activeIncident = action.payload;
        state.incidents.unshift(action.payload);
      })
      .addCase(createSos.rejected, (state, action) => {
        state.status = 'error';
        state.error = action.payload;
      })
      .addCase(fetchSosIncidents.fulfilled, (state, action) => {
        state.incidents = action.payload;
      })
      .addCase(updateSosIncident.fulfilled, (state, action) => {
        const idx = state.incidents.findIndex((i) => i.id === action.payload.id);
        if (idx !== -1) {
          state.incidents[idx] = action.payload;
        }
        if (state.activeIncident?.id === action.payload.id) {
          state.activeIncident = action.payload;
        }
      });
  }
});

export const { addIncident, updateIncident, clearSosError, setIncidents, setSirenActive } = sosSlice.actions;
export default sosSlice.reducer;
