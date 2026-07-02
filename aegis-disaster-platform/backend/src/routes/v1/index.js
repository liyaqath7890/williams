import { Router } from 'express';
import { authRouter } from './auth.routes.js';
import { sosRouter } from './sos.routes.js';
import { alertRouter } from './alert.routes.js';
import { chatRouter } from './chat.routes.js';
import { shelterRouter } from './shelter.routes.js';
import { resourceRouter } from './resource.routes.js';
import { missingPersonRouter } from './missingPerson.routes.js';
import { analyticsRouter } from './analytics.routes.js';
import { reportRouter } from './report.routes.js';
import { notificationRouter } from './notification.routes.js';
import { simulationRouter } from './simulation.routes.js';
import { uploadRouter } from './upload.routes.js';
import aiChatRouter from './aiChat.routes.js';

export const apiV1Router = Router();

apiV1Router.use('/auth', authRouter);
apiV1Router.use('/sos', sosRouter);
apiV1Router.use('/alerts', alertRouter);
apiV1Router.use('/chat', chatRouter);
apiV1Router.use('/shelters', shelterRouter);
apiV1Router.use('/resources', resourceRouter);
apiV1Router.use('/missing-persons', missingPersonRouter);
apiV1Router.use('/analytics', analyticsRouter);
apiV1Router.use('/reports', reportRouter);
apiV1Router.use('/notifications', notificationRouter);
apiV1Router.use('/uploads', uploadRouter);
apiV1Router.use('/ai', aiChatRouter);
apiV1Router.use('/', simulationRouter);

