import { z } from 'zod';

export const registerSchema = z.object({
  body: z.object({
    name: z.string().min(2),
    email: z.string().email(),
    password: z.string().min(8),
    role: z.enum(['victim', 'authority', 'admin', 'helper']).default('victim')
  })
});

export const loginSchema = z.object({
  body: z.object({
    email: z.string().email(),
    password: z.string().min(1),
    role: z.enum(['victim', 'authority', 'admin', 'helper']).optional()
  })
});

export const verifyEmailSchema = z.object({
  query: z.object({
    token: z.string().min(1)
  })
});
