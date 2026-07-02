import { httpClient } from '../api/httpClient';

export const chatService = {
  listRooms: () => httpClient.get('/chat/rooms'),
  listMessages: (roomId) => httpClient.get(`/chat/rooms/${roomId}/messages`)
};
