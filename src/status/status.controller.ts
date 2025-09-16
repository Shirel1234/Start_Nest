// src/status/status.controller.ts
import { Controller, Get, Post, Body, HttpCode } from '@nestjs/common';
import { StatusService } from './status.service';
import { updateStatusSchema } from './dto/update.dto';
import type { UpdateStatusDto } from './dto/update.dto';
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe';

@Controller('status')
export class StatusController {
  constructor(private readonly statusService: StatusService) {}

  @Get()
  async getStatus() {
    return this.statusService.checkStatus();
  }

  @Post('update')
  @HttpCode(200)
  async updateStatus(
    @Body(new ZodValidationPipe(updateStatusSchema)) body: UpdateStatusDto,
  ) {
    return this.statusService.updateStatus(body);
  }
}
