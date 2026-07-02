import { useState } from 'react';
import { aiService } from '../services/aiService';

export function useAI() {
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState(null);
  const [error, setError] = useState(null);

  async function ask(prompt, opts = {}) {
    setLoading(true);
    setError(null);
    setResponse(null);
    try {
      const res = await aiService.chat({ prompt, maxTokens: opts.maxTokens });
      setResponse(res.data?.data?.text || res.data?.data || res.data);
      return res.data;
    } catch (err) {
      setError(err.response?.data?.message || err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }

  return { ask, loading, response, error };
}
