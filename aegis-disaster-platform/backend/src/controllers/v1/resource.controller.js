import { asyncHandler } from '../../utils/asyncHandler.js';
import { sendSuccess } from '../../utils/apiResponse.js';
import { createResource, deleteResource, listResources, updateResource } from '../../services/resource.service.js';
import { emitResourceChanged } from '../../sockets/emitters.js';

export const getResources = asyncHandler(async (req, res) => {
  sendSuccess(res, await listResources(req.query), 'Resources loaded');
});

export const postResource = asyncHandler(async (req, res) => {
  const resource = await createResource(req.user.id, req.body);
  emitResourceChanged('created', resource);
  sendSuccess(res, resource, 'Resource created', 201);
});

export const patchResource = asyncHandler(async (req, res) => {
  const resource = await updateResource(req.params.id, req.body);
  emitResourceChanged('updated', resource);
  sendSuccess(res, resource, 'Resource updated');
});

export const removeResource = asyncHandler(async (req, res) => {
  const result = await deleteResource(req.params.id);
  emitResourceChanged('deleted', result);
  sendSuccess(res, result, 'Resource deleted');
});
