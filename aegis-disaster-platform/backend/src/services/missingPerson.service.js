import { Op } from 'sequelize';
import { MissingPerson, User } from '../models/index.js';

function pageOptions(query) {
  const page = Math.max(Number(query.page || 1), 1);
  const limit = Math.min(Math.max(Number(query.limit || 25), 1), 100);
  return { page, limit, offset: (page - 1) * limit };
}

function response(rows, count, page, limit) {
  return { rows, count, page, limit, totalPages: Math.max(Math.ceil(count / limit), 1) };
}

export async function listMissingPersons(query = {}) {
  const { page, limit, offset } = pageOptions(query);
  const where = {};
  if (query.status && query.status !== 'all') where.status = query.status;
  if (query.search) {
    where[Op.or] = [
      { fullName: { [Op.iLike]: `%${query.search}%` } },
      { description: { [Op.iLike]: `%${query.search}%` } },
      { gender: { [Op.iLike]: `%${query.search}%` } }
    ];
  }
  const { rows, count } = await MissingPerson.findAndCountAll({
    where,
    include: [{ model: User, as: 'reportedBy', attributes: ['id', 'name', 'role'] }],
    order: [['createdAt', 'DESC']],
    limit,
    offset
  });
  return response(rows, count, page, limit);
}

export function createMissingPerson(userId, payload) {
  const timeline = payload.timeline?.length ? payload.timeline : [{ at: new Date().toISOString(), event: 'Case opened', status: payload.status || 'missing' }];
  const lastSeenHistory = payload.lastSeenHistory?.length ? payload.lastSeenHistory : (payload.lastSeenLocation?.address ? [{ at: new Date().toISOString(), location: payload.lastSeenLocation }] : []);
  return MissingPerson.create({ ...payload, timeline, lastSeenHistory, reportedById: userId });
}

export async function updateMissingPerson(id, payload) {
  const report = await MissingPerson.findByPk(id);
  if (!report) {
    const error = new Error('Missing person report not found');
    error.statusCode = 404;
    throw error;
  }
  const next = { ...payload };
  if (payload.status && payload.status !== report.status) {
    next.timeline = [...(report.timeline || []), { at: new Date().toISOString(), event: `Status changed to ${payload.status}`, status: payload.status }];
  }
  if (payload.lastSeenLocation?.address && payload.lastSeenLocation.address !== report.lastSeenLocation?.address) {
    next.lastSeenHistory = [...(report.lastSeenHistory || []), { at: new Date().toISOString(), location: payload.lastSeenLocation }];
  }
  return report.update(next);
}

export function updateMissingPersonStatus(id, status) {
  return updateMissingPerson(id, { status });
}

export async function deleteMissingPerson(id) {
  const report = await MissingPerson.findByPk(id);
  if (!report) {
    const error = new Error('Missing person report not found');
    error.statusCode = 404;
    throw error;
  }
  await report.destroy();
  return { id };
}
