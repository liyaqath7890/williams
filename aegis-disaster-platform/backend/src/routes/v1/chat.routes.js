import { Router } from 'express';
import { listMessages, listRooms } from '../../controllers/v1/chat.controller.js';
import { requireAuth } from '../../middleware/authMiddleware.js';

export const chatRouter = Router();

chatRouter.use(requireAuth);
chatRouter.get('/rooms', listRooms);
chatRouter.get('/rooms/:roomId/messages', listMessages);
