import { asyncHandler } from '../../utils/asyncHandler.js';
import { sendSuccess } from '../../utils/apiResponse.js';
import { createUpload, deleteUpload, listUploads } from '../../services/upload.service.js';

export const getUploads = asyncHandler(async (_req, res) => {
  sendSuccess(res, await listUploads(), 'Uploads loaded');
});

export const uploadSingleFile = asyncHandler(async (req, res) => {
  const metadata = req.body?.metadata ? JSON.parse(req.body.metadata) : {};
  sendSuccess(res, await createUpload(req.user.id, req.file, metadata), 'File uploaded', 201);
});

export const removeUpload = asyncHandler(async (req, res) => {
  sendSuccess(res, await deleteUpload(req.params.id), 'Upload deleted');
});
