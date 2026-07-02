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

export const detectPanic = asyncHandler(async (req, res) => {
  const { text } = req.body;
  const prompt = `Analyze this text for panic: "${text}"`;
  const response = await callOpenAI(prompt, { maxTokens: 100 });
  try {
    const data = JSON.parse(response);
    sendSuccess(res, data, 'Panic detection complete');
  } catch {
    sendSuccess(res, { isPanic: false, confidence: 0 }, 'Panic detection complete');
  }
});

export const getAiPrediction = asyncHandler(async (req, res) => {
  const prompt = 'Generate a disaster prediction analysis.';
  const response = await callOpenAI(prompt, { maxTokens: 200 });
  try {
    const data = JSON.parse(response);
    sendSuccess(res, data, 'AI prediction generated');
  } catch {
    sendSuccess(res, { riskLevel: 'Unknown', confidence: 0, factors: [] }, 'AI prediction generated');
  }
});
