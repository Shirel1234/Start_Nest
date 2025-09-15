import { StatusEnum } from 'src/common/enums/status.enum';
import { z } from 'zod';

export const LocationSchema = z.object({
  lat: z.number().min(29).max(33),
  lng: z.number().min(34).max(36),
});
export const AlertsSchema = z.array(z.number());

export const RecordSchema = z.object({
  id: z.number(),
  name: z
    .string()
    .regex(
      /^[a-zA-Z0-9 ]+$/,
      'Name must be alphanumeric, no special characters',
    ),
  create_date: z.string().refine(
    (val) => !isNaN(Date.parse(val)),
    { message: 'Invalid datetime format' }, // must be valid date-time string
  ),
  location: LocationSchema,
  alerts: AlertsSchema.optional(),
  status: z.nativeEnum(StatusEnum),
  description: z.string().optional(),
});
