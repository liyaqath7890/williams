import { asyncHandler } from '../../utils/asyncHandler.js';
import { sendSuccess } from '../../utils/apiResponse.js';
import { createMissingPerson, deleteMissingPerson, listMissingPersons, updateMissingPerson, updateMissingPersonStatus } from '../../services/missingPerson.service.js';
import { emitMissingPersonChanged } from '../../sockets/emitters.js';

export const getMissingPersons = asyncHandler(async (req, res) => {
  sendSuccess(res, await listMissingPersons(req.query), 'Missing person reports loaded');
});

export const postMissingPerson = asyncHandler(async (req, res) => {
  const person = await createMissingPerson(req.user.id, req.body);
  emitMissingPersonChanged('created', person);
  sendSuccess(res, person, 'Missing person report created', 201);
});

export const patchMissingPerson = asyncHandler(async (req, res) => {
  const person = await updateMissingPerson(req.params.id, req.body);
  emitMissingPersonChanged('updated', person);
  sendSuccess(res, person, 'Missing person report updated');
});

export const patchMissingPersonStatus = asyncHandler(async (req, res) => {
  const person = await updateMissingPersonStatus(req.params.id, req.body.status);
  emitMissingPersonChanged('updated', person);
  sendSuccess(res, person, 'Missing person status updated');
});

export const removeMissingPerson = asyncHandler(async (req, res) => {
  const result = await deleteMissingPerson(req.params.id);
  emitMissingPersonChanged('deleted', result);
  sendSuccess(res, result, 'Missing person report deleted');
});
