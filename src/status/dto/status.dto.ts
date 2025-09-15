import { z } from 'zod';

export const StatusQuerySchema = z.object({
  extended: z
    .string()
    .optional()
    .transform((val) => val === 'true'),
});

export type StatusQueryDto = z.infer<typeof StatusQuerySchema>;
