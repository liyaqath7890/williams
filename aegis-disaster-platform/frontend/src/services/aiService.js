import { httpClient } from '../api/httpClient';

export const aiService = {
  chat: ({ prompt, maxTokens } = {}) => httpClient.post('/ai/chat', { prompt, maxTokens })
};
