import { z } from 'zod';

export const createSosSchema = z.object({
  body: z.object({
    disasterType: z.string().min(2),
    severity: z.enum(['low', 'medium', 'high', 'critical']).default('high'),
    description: z.string().optional(),
    location: z.object({
      lat: z.coerce.number(),
      lng: z.coerce.number(),
      address: z.string().optional()
    })
  })
});
