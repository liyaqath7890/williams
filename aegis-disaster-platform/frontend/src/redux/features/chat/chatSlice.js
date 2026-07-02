import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { chatService } from '../../../services/chatService';

export const fetchChatRooms = createAsyncThunk('chat/rooms', async (_, { rejectWithValue }) => {
  try {
    const response = await chatService.listRooms();
    return response.data.data;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'Unable to load chat rooms');
  }
});

export const fetchRoomMessages = createAsyncThunk('chat/messages', async (roomId, { rejectWithValue }) => {
  try {
    const response = await chatService.listMessages(roomId);
    return { roomId, messages: response.data.data };
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'Unable to load room messages');
  }
});

const chatSlice = createSlice({
  name: 'chat',
  initialState: {
    rooms: [],
    activeRoomId: null,
    messagesByRoom: {},
    usersByRoom: {},
    typingByRoom: {},
    status: 'idle',
    error: null
  },
  reducers: {
    setActiveRoom: (state, action) => {
      state.activeRoomId = action.payload;
    },
    addMessage: (state, action) => {
      const message = action.payload;
      const roomMessages = state.messagesByRoom[message.roomId] || [];
      const exists = roomMessages.some((item) => item.id === message.id);
      if (!exists) {
        state.messagesByRoom[message.roomId] = [...roomMessages, message];
      }
    },
    setRoomUsers: (state, action) => {
      state.usersByRoom[action.payload.roomId] = action.payload.users;
    },
    setTypingUser: (state, action) => {
      const { roomId, user } = action.payload;
      const current = state.typingByRoom[roomId] || [];
      if (!current.some((item) => item.id === user.id)) {
        state.typingByRoom[roomId] = [...current, user];
      }
    },
    removeTypingUser: (state, action) => {
      const { roomId, user } = action.payload;
      state.typingByRoom[roomId] = (state.typingByRoom[roomId] || []).filter((item) => item.id !== user.id);
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchChatRooms.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchChatRooms.fulfilled, (state, action) => {
        state.rooms = action.payload;
        state.activeRoomId = state.activeRoomId || action.payload[0]?.id || null;
        state.status = 'succeeded';
      })
      .addCase(fetchChatRooms.rejected, (state, action) => {
        state.status = 'error';
        state.error = action.payload;
      })
      .addCase(fetchRoomMessages.fulfilled, (state, action) => {
        state.messagesByRoom[action.payload.roomId] = action.payload.messages;
      });
  }
});

export const { addMessage, removeTypingUser, setActiveRoom, setRoomUsers, setTypingUser } = chatSlice.actions;
export default chatSlice.reducer;
