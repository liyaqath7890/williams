import { Router } from 'express';
import { createSos, listSos, updateSos } from '../../controllers/v1/sos.controller.js';
import { requireAuth } from '../../middleware/authMiddleware.js';
import { validateRequest } from '../../middleware/validateRequest.js';
import { createSosSchema } from '../../validations/sos.validation.js';

export const sosRouter = Router();

sosRouter.use(requireAuth);
sosRouter.route('/').get(listSos).post(validateRequest(createSosSchema), createSos);
sosRouter.route('/:id').patch(updateSos);
