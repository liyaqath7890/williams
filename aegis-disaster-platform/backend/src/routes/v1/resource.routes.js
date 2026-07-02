import { Router } from 'express';
import { getResources, patchResource, postResource, removeResource } from '../../controllers/v1/resource.controller.js';
import { requireAuth } from '../../middleware/authMiddleware.js';

export const resourceRouter = Router();

resourceRouter.use(requireAuth);
resourceRouter.get('/', getResources);
resourceRouter.post('/', postResource);
resourceRouter.patch('/:id', patchResource);
resourceRouter.delete('/:id', removeResource);
