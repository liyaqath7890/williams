import { Router } from 'express';
import { z } from 'zod';
import { chat, detectPanic, getAiPrediction } from '../../controllers/v1/ai.controller.js';
import * as aiChatController from '../../controllers/v1/aiChat.controller.js';
import { requireAuth } from '../../middleware/authMiddleware.js';
import { validateRequest } from '../../middleware/validateRequest.js';

const router = Router();

const chatSchema = z.object({
  body: z.object({
    prompt: z.string().min(1),
    maxTokens: z.number().optional()
  })
});

router.post('/chat', requireAuth, validateRequest(chatSchema), chat);

// Public route: emergency guidance must be accessible without login.
router.post('/guidance', aiChatController.getEmergencyGuidance);

router.post('/panic-detection', detectPanic);
router.get('/predictions', getAiPrediction);

export default router;
