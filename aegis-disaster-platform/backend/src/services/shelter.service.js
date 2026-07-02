import { Op } from 'sequelize';
import { Shelter } from '../models/index.js';

function pageOptions(query) {
  const page = Math.max(Number(query.page || 1), 1);
  const limit = Math.min(Math.max(Number(query.limit || 25), 1), 100);
  return { page, limit, offset: (page - 1) * limit };
}

function response(rows, count, page, limit) {
  return { rows, count, page, limit, totalPages: Math.max(Math.ceil(count / limit), 1) };
}

export async function listShelters(query = {}) {
  const { page, limit, offset } = pageOptions(query);
  const where = {};
  if (query.status && query.status !== 'all') where.status = query.status;
  if (query.search) {
    where[Op.or] = [
      { name: { [Op.iLike]: `%${query.search}%` } },
      { contactNumber: { [Op.iLike]: `%${query.search}%` } }
    ];
  }
  const { rows, count } = await Shelter.findAndCountAll({ where, order: [['createdAt', 'DESC']], limit, offset });
  return response(rows, count, page, limit);
}

export function createShelter(payload) {
  return Shelter.create(payload);
}

export async function updateShelter(id, payload) {
  const shelter = await Shelter.findByPk(id);
  if (!shelter) {
    const error = new Error('Shelter not found');
    error.statusCode = 404;
    throw error;
  }
  return shelter.update(payload);
}

export async function deleteShelter(id) {
  const shelter = await Shelter.findByPk(id);
  if (!shelter) {
    const error = new Error('Shelter not found');
    error.statusCode = 404;
    throw error;
  }
  await shelter.destroy();
  return { id };
}
