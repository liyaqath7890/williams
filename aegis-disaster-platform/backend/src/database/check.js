import { sequelize } from '../models/index.js';

try {
  await sequelize.authenticate();
  console.log('PostgreSQL connection is healthy.');
} catch (error) {
  console.error('PostgreSQL connection failed.');
  console.error(error.message);
  process.exitCode = 1;
} finally {
  await sequelize.close();
}
