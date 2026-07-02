import { sequelize } from '../models/index.js';

try {
  await sequelize.authenticate();
  await sequelize.sync({ alter: true });
  console.log('PostgreSQL tables are synced.');
} catch (error) {
  console.error('Database sync failed.');
  console.error(error.message);
  process.exitCode = 1;
} finally {
  await sequelize.close();
}
