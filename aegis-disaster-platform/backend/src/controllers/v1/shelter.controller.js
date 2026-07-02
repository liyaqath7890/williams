import { asyncHandler } from '../../utils/asyncHandler.js';
import { sendSuccess } from '../../utils/apiResponse.js';
import { createShelter, deleteShelter, listShelters, updateShelter } from '../../services/shelter.service.js';
import { emitShelterChanged } from '../../sockets/emitters.js';

export const getShelters = asyncHandler(async (req, res) => {
  sendSuccess(res, await listShelters(req.query), 'Shelters loaded');
});

export const postShelter = asyncHandler(async (req, res) => {
  const shelter = await createShelter(req.body);
  emitShelterChanged('created', shelter);
  sendSuccess(res, shelter, 'Shelter created', 201);
});

export const patchShelter = asyncHandler(async (req, res) => {
  const shelter = await updateShelter(req.params.id, req.body);
  emitShelterChanged('updated', shelter);
  sendSuccess(res, shelter, 'Shelter updated');
});

export const removeShelter = asyncHandler(async (req, res) => {
  const result = await deleteShelter(req.params.id);
  emitShelterChanged('deleted', result);
  sendSuccess(res, result, 'Shelter deleted');
});
