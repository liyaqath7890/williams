import { Op } from 'sequelize';
import { Resource } from '../models/index.js';

function pageOptions(query) {
  const page = Math.max(Number(query.page || 1), 1);
  const limit = Math.min(Math.max(Number(query.limit || 25), 1), 100);
  return { page, limit, offset: (page - 1) * limit };
}

function response(rows, count, page, limit) {
  return { rows, count, page, limit, totalPages: Math.max(Math.ceil(count / limit), 1) };
}

export async function listResources(query = {}) {
  const { page, limit, offset } = pageOptions(query);
  const where = {};
  if (query.status && query.status !== 'all') where.status = query.status;
  if (query.category && query.category !== 'all') where.category = query.category;
  if (query.search) {
    where[Op.or] = [
      { name: { [Op.iLike]: `%${query.search}%` } },
      { unit: { [Op.iLike]: `%${query.search}%` } },
      { assignedTo: { [Op.iLike]: `%${query.search}%` } }
    ];
  }
  const { rows, count } = await Resource.findAndCountAll({ where, order: [['createdAt', 'DESC']], limit, offset });
  return response(rows, count, page, limit);
}

export function createResource(userId, payload) {
  return Resource.create({ ...payload, ownerId: userId });
}

export async function updateResource(id, payload) {
  const resource = await Resource.findByPk(id);
  if (!resource) {
    const error = new Error('Resource not found');
    error.statusCode = 404;
    throw error;
  }
  return resource.update(payload);
}

export async function deleteResource(id) {
  const resource = await Resource.findByPk(id);
  if (!resource) {
    const error = new Error('Resource not found');
    error.statusCode = 404;
    throw error;
  }
  await resource.destroy();
  return { id };
}
