import { Router } from 'express';
import { getUploads, removeUpload, uploadSingleFile } from '../../controllers/v1/upload.controller.js';
import { requireAuth } from '../../middleware/authMiddleware.js';
import { upload } from '../../middleware/uploadMiddleware.js';

export const uploadRouter = Router();

uploadRouter.use(requireAuth);
uploadRouter.get('/', getUploads);
uploadRouter.post('/single', upload.single('file'), uploadSingleFile);
uploadRouter.delete('/:id', removeUpload);
