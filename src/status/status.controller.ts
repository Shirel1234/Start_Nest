import {
  Controller,
  Get,
  Query,
  UsePipes,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { StatusService } from './status.service';
import { AppLogger } from '../common/logger/logger.service';
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe';
import { StatusQuerySchema } from './dto/status.dto';
import type { StatusQueryDto } from './dto/status.dto';

@Controller('status')
export class StatusController {
  constructor(
    private readonly statusService: StatusService,
    private readonly logger: AppLogger,
  ) {}

  @Get()
  @UsePipes(new ZodValidationPipe(StatusQuerySchema))
  async getStatus(@Query() query: StatusQueryDto) {
    this.logger.log('Checking system status', StatusController.name);

    const dbOk = await this.statusService.checkDb();

    if (!dbOk) {
      this.logger.error('Database unavailable', '', StatusController.name);
      throw new HttpException(
        'Database unavailable',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    const response = {
      status: 'ok',
      db: dbOk ? 'available' : 'unavailable',
      extended: query.extended || false,
      timestamp: new Date().toISOString(),
    };

    this.logger.log(
      `Status response: ${JSON.stringify(response)}`,
      StatusController.name,
    );
    return response;
  }
}
