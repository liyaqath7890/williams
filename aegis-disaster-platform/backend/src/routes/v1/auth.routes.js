import { Router } from 'express';
import { login, logout, me, refresh, register, verifyEmail, listHelpers } from '../../controllers/v1/auth.controller.js';
import { requireAuth } from '../../middleware/authMiddleware.js';
import { validateRequest } from '../../middleware/validateRequest.js';
import { loginSchema, registerSchema, verifyEmailSchema } from '../../validations/auth.validation.js';

export const authRouter = Router();

authRouter.post('/register', validateRequest(registerSchema), register);
authRouter.post('/login', validateRequest(loginSchema), login);
authRouter.get('/verify-email', validateRequest(verifyEmailSchema), verifyEmail);
authRouter.post('/refresh', refresh);
authRouter.post('/logout', logout);
authRouter.get('/me', requireAuth, me);
authRouter.get('/helpers', requireAuth, listHelpers);
