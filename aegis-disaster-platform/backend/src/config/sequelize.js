import { Sequelize } from 'sequelize';
import { env } from './env.js';

export const sequelize = new Sequelize(env.databaseUrl || 'postgres://postgres:postgres@localhost:5432/aegis', {
  dialect: 'postgres',
  logging: false,
  dialectOptions: env.dbSsl
    ? {
        ssl: {
          require: true,
          rejectUnauthorized: false
        }
      }
    : {}
});
