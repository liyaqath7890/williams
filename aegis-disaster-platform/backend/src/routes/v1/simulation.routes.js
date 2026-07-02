import { Router } from 'express';
import { getAiPrediction, getDroneMission, launchDroneMission, stopDroneMissionRoute, postPanicDetection } from '../../controllers/v1/simulation.controller.js';
import { requireAuth } from '../../middleware/authMiddleware.js';

export const simulationRouter = Router();

simulationRouter.use(requireAuth);
simulationRouter.get('/ai/predictions', getAiPrediction);
simulationRouter.post('/ai/panic-detection', postPanicDetection);
simulationRouter.get('/drone', getDroneMission);
simulationRouter.post('/drone/launch', launchDroneMission);
simulationRouter.post('/drone/stop', stopDroneMissionRoute);
