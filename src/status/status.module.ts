import { Module } from '@nestjs/common';
import { StatusController } from './status.controller';
import { StatusService } from './status.service';
import { AppLogger } from '../common/logger/logger.service';

@Module({
  controllers: [StatusController],
  providers: [StatusService, AppLogger],
})
export class StatusModule {}
