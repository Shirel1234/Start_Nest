// src/status/status.service.ts
import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateStatusDto } from './dto/update.dto';
import { Cron, CronExpression } from '@nestjs/schedule';
import axios from 'axios';

@Injectable()
export class StatusService {
  private readonly logger = new Logger(StatusService.name);
  constructor(private prismaStatusService: PrismaService) {}

  async checkStatus() {
    try {
      await this.prismaStatusService.$queryRaw`SELECT 1`;
      return { status: 'ok' };
    } catch {
      throw new BadRequestException('Database not reachable');
    }
  }

  async updateStatus(data: UpdateStatusDto) {
    if (new Date(data.create_date) > new Date()) {
      throw new BadRequestException('create_date cannot be in the future');
    }

    const existing = await this.prismaStatusService.record.findUnique({
      where: { id: data.id },
    });
    const mappedData = {
      name: data.name,
      create_date: new Date(data.create_date),
      locationLat: data.location.latitude,
      locationLon: data.location.longitude,
      alerts: data.alerts,
      status: data.status,
      description: data.description,
    };
    if (existing) {
      await this.prismaStatusService.record.update({
        where: { id: data.id },
        data: mappedData,
      });
    } else {
      await this.prismaStatusService.record.create({ data: mappedData });
    }

    const israelDate = new Date(data.create_date).toLocaleString('en-IL', {
      timeZone: 'Asia/Jerusalem',
    });

    const payloads = data.alerts.map((alert) => ({
      ...data,
      create_date: israelDate,
      alert,
    }));

    for (const payload of payloads) {
      try {
        await axios.post('https://httpbin.org/post', payload);
      } catch (err: unknown) {
        if (err instanceof Error) {
          console.error('Error sending alert', payload.alert, err.message);
        } else {
          console.error('Error sending alert', payload.alert, err);
        }
      }
    }

    return { success: true };
  }

  @Cron(CronExpression.EVERY_MINUTE)
  async handleStatusCron() {
    this.logger.log('Running status cron job...');

    const now = new Date();

    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
    await this.prismaStatusService.record.updateMany({
      where: {
        status: 1,
        create_date: { lt: oneHourAgo },
      },
      data: {
        status: 2,
      },
    });

    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    await this.prismaStatusService.record.updateMany({
      where: {
        create_date: { lt: oneDayAgo },
      },
      data: {
        status: 5,
      },
    });

    this.logger.log('Status cron job finished.');
  }
}
