import { redis } from '../config/redis.js';

export async function getCache(key) {
  if (!redis) return null;
  const value = await redis.get(key);
  return value ? JSON.parse(value) : null;
}

export async function setCache(key, value, ttlSeconds = 300) {
  if (!redis) return null;
  return redis.set(key, JSON.stringify(value), 'EX', ttlSeconds);
}
