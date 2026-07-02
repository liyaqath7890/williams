import { Router } from 'express';
import { getMissingPersons, patchMissingPerson, patchMissingPersonStatus, postMissingPerson, removeMissingPerson } from '../../controllers/v1/missingPerson.controller.js';
import { requireAuth } from '../../middleware/authMiddleware.js';

export const missingPersonRouter = Router();

missingPersonRouter.use(requireAuth);
missingPersonRouter.get('/', getMissingPersons);
missingPersonRouter.post('/', postMissingPerson);
missingPersonRouter.patch('/:id', patchMissingPerson);
missingPersonRouter.patch('/:id/status', patchMissingPersonStatus);
missingPersonRouter.delete('/:id', removeMissingPerson);
