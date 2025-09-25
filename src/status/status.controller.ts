import { Controller, Get, Post, Body, HttpCode } from '@nestjs/common';
import { StatusService } from './status.service';
import { ApiTags, ApiBody, ApiResponse } from '@nestjs/swagger';
import { updateStatusSchema, UpdateStatusDtoSwagger } from './dto/update.dto';
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe';

@ApiTags('status')
@Controller()
export class StatusController {
  constructor(private readonly statusService: StatusService) {}

  @Get('status')
  @ApiResponse({ status: 200, description: 'Server is up' })
  async getStatus(): Promise<{ status: string }> {
    return await this.statusService.checkStatus();
  }

  @Post('update')
  @HttpCode(200)
  @ApiBody({ type: UpdateStatusDtoSwagger })
  @ApiResponse({ status: 200, description: 'Update processed' })
  @ApiResponse({ status: 400, description: 'Validation error' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async updateStatus(
    @Body(new ZodValidationPipe(updateStatusSchema))
    body: UpdateStatusDtoSwagger,
  ) {
    return this.statusService.updateStatus(body);
  }
}
