import { env } from '../config/env.js';

const OPENAI_URL = 'https://api.openai.com/v1/chat/completions';

export async function callOpenAI(prompt, { model = 'gpt-3.5-turbo', maxTokens = 512 } = {}) {
  if (!env.openAIApiKey) {
    console.warn('OpenAI API key not configured, returning mocked AI response');
    if (prompt.includes('panic') || prompt.includes('detect')) {
      return JSON.stringify({ isPanic: true, confidence: 0.85, sentiment: 'highly distressed' });
    }
    if (prompt.includes('prediction')) {
      return JSON.stringify({ riskLevel: 'High', confidence: 0.9, factors: ['Rainfall', 'Water levels'] });
    }
    return `[Mock AI Response]: Based on your input, here is some general emergency advice: Stay calm, locate your nearest exit, and wait for official instructions.`;
  }

  const body = {
    model,
    messages: [{ role: 'user', content: prompt }],
    max_tokens: maxTokens,
    temperature: 0.2
  };

  const resp = await fetch(OPENAI_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${env.openAIApiKey}`
    },
    body: JSON.stringify(body)
  });

  if (!resp.ok) {
    const text = await resp.text();
    const error = new Error('OpenAI request failed: ' + text);
    error.statusCode = resp.status;
    throw error;
  }

  const data = await resp.json();
  const reply = data.choices?.[0]?.message?.content || '';
  return reply.trim();
}
