import Redis from 'ioredis';
import { env } from './env.js';

export const redis = env.redisUrl ? new Redis(env.redisUrl) : null;
