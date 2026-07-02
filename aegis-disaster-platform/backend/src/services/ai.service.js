import { env } from '../config/env.js';

const OPENAI_URL = 'https://api.openai.com/v1/chat/completions';

export async function callOpenAI(prompt, { model = 'gpt-3.5-turbo', maxTokens = 512 } = {}) {
  if (!env.openAIApiKey) {
    const err = new Error('OpenAI API key not configured');
    err.statusCode = 500;
    throw err;
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
