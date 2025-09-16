import { z } from 'zod';

export const updateStatusSchema = z.object({
  id: z.number(),
  name: z.string().regex(/^[a-zA-Z0-9 ]+$/, 'Name must be alphanumeric'),
  create_date: z.string().datetime(),
  location: z.object({
    latitude: z.number().min(-90).max(90),
    longitude: z.number().min(-180).max(180),
  }),
  alerts: z.array(z.number()).nonempty(),
  status: z.number().min(1).max(6),
  description: z.string(),
});

export type UpdateStatusDto = z.infer<typeof updateStatusSchema>;
