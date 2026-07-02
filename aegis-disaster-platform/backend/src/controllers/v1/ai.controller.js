import { asyncHandler } from '../../utils/asyncHandler.js';
import { sendSuccess } from '../../utils/apiResponse.js';
import { callOpenAI } from '../../services/ai.service.js';

export const chat = asyncHandler(async (req, res) => {
  const { prompt, maxTokens } = req.body;
  if (!prompt || typeof prompt !== 'string') {
    const err = new Error('Prompt is required');
    err.statusCode = 400;
    throw err;
  }

  const text = await callOpenAI(prompt, { maxTokens });
  sendSuccess(res, { text }, 'AI response');
});
