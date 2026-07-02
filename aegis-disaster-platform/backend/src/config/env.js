import dotenv from 'dotenv';

dotenv.config();

const parseOrigins = (value, fallback) => {
  const origins = (value || fallback).split(',').map((origin) => origin.trim()).filter(Boolean);
  return origins.length ? origins : [];
};

const nodeEnv = process.env.NODE_ENV || 'development';
const allowAnyOrigin = !process.env.CLIENT_ORIGIN && nodeEnv === 'production';

export const env = {
  nodeEnv,
  allowAnyOrigin,
  port: Number(process.env.PORT || 5000),
  clientOrigin: parseOrigins(process.env.CLIENT_ORIGIN, allowAnyOrigin ? '' : 'http://localhost:5173'),
  databaseUrl: process.env.DATABASE_URL || '',
  dbSsl: process.env.DB_SSL === 'true',
  dbSync: process.env.DB_SYNC !== 'false',
  jwtSecret: process.env.JWT_SECRET || 'development-secret',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  jwtRefreshSecret: process.env.JWT_REFRESH_SECRET || 'development-refresh-secret',
  jwtRefreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '30d',
  refreshCookieName: process.env.REFRESH_COOKIE_NAME || 'aegis_refresh_token',
  redisUrl: process.env.REDIS_URL,
  cloudinary: {
    cloudName: process.env.CLOUDINARY_CLOUD_NAME,
    apiKey: process.env.CLOUDINARY_API_KEY,
    apiSecret: process.env.CLOUDINARY_API_SECRET
  }
  ,
  openAIApiKey: process.env.OPENAI_API_KEY || ''
};
