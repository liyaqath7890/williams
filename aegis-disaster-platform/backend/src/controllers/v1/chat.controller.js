import { asyncHandler } from '../../utils/asyncHandler.js';
import { sendSuccess } from '../../utils/apiResponse.js';
import { listChatRoomsForRole, listRoomMessages } from '../../services/chat.service.js';

export const listRooms = asyncHandler(async (req, res) => {
  const rooms = await listChatRoomsForRole(req.user.role);
  sendSuccess(res, rooms, 'Chat rooms loaded');
});

export const listMessages = asyncHandler(async (req, res) => {
  const messages = await listRoomMessages(req.params.roomId);
  sendSuccess(res, messages, 'Chat messages loaded');
});
