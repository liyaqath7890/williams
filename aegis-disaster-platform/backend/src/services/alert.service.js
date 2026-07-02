import { Alert } from '../models/Alert.js';

export async function createAlert(userId, payload) {
  return Alert.create({ ...payload, createdById: userId });
}

export async function listAlerts() {
  return Alert.findAll({ order: [['createdAt', 'DESC']] });
}

export async function deleteAlert(id) {
  const alert = await Alert.findByPk(id);
  if (!alert) {
    const error = new Error('Alert not found');
    error.statusCode = 404;
    throw error;
  }
  await alert.destroy();
  return { id };
}
