import { SosIncident } from '../models/SosIncident.js';
import { User } from '../models/User.js';

export async function createSosIncident(userId, payload) {
  const incident = await SosIncident.create({
    ...payload,
    createdById: userId
  });

  return SosIncident.findByPk(incident.id, {
    include: [{ model: User, as: 'createdBy', attributes: ['id', 'name', 'email', 'role'] }]
  });
}

export async function listSosIncidents() {
  return SosIncident.findAll({
    include: [{ model: User, as: 'createdBy', attributes: ['id', 'name', 'email', 'role'] }],
    order: [['createdAt', 'DESC']]
  });
}
