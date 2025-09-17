import { z } from 'zod';
import { ApiProperty } from '@nestjs/swagger';

/**
 * Zod schema - validation runtime
 */
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

export class UpdateStatusDtoSwagger {
  @ApiProperty({ example: 1, description: 'Unique record ID' })
  id: number;

  @ApiProperty({
    example: 'TestRecord',
    description: 'Name must be alphanumeric',
  })
  name: string;

  @ApiProperty({
    example: '2025-09-16T10:00:00Z',
    description: 'Create date in ISO format',
  })
  create_date: string;

  @ApiProperty({
    description: 'Location coordinates',
    type: () => Object,
    example: { latitude: 31.778, longitude: 35.235 },
  })
  location: {
    latitude: number;
    longitude: number;
  };

  @ApiProperty({ example: [101, 102], description: 'Array of alert IDs' })
  alerts: number[];

  @ApiProperty({
    example: 1,
    description: 'Status from 1 (Open) to 6 (Cancelled)',
  })
  status: number;

  @ApiProperty({ example: 'This is a test', description: 'Record description' })
  description: string;
}
