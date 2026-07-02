import { sequelize } from '../models/index.js';
import { env } from './env.js';

export async function connectDatabase() {
  if (!env.databaseUrl) {
    console.warn('DATABASE_URL is not set. API started without PostgreSQL connection.');
    return;
  }

  try {
    await sequelize.authenticate();

    if (env.dbSync) {
      await sequelize.sync({ alter: true });
    }

    console.log('PostgreSQL connected');
  } catch (error) {
    if (env.nodeEnv === 'production') {
      throw error;
    }

    console.warn('PostgreSQL connection failed. API started in degraded mode.');
    console.warn(error.message);
  }
}
