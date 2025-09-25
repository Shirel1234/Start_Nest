import {
  Injectable,
  Logger,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateStatusDto } from './dto/update.dto';
import { Cron, CronExpression } from '@nestjs/schedule';
import axios from 'axios';

@Injectable()
export class StatusService {
  private readonly logger = new Logger(StatusService.name);

  constructor(private prisma: PrismaService) {}

  async checkStatus() {
    try {
      await this.prisma.$queryRaw`SELECT 1`;
      this.logger.log('Database reachable, server is OK');
      return { status: 'ok' };
    } catch (err) {
      this.logger.error('Database not reachable', err);
      throw new InternalServerErrorException('Database not reachable');
    }
  }

  async updateStatus(data: UpdateStatusDto) {
    try {
      if (new Date(data.create_date) > new Date()) {
        throw new BadRequestException('create_date cannot be in the future');
      }

      const existing = await this.prisma.record.findUnique({
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
        await this.prisma.record.update({
          where: { id: data.id },
          data: mappedData,
        });
        this.logger.log(`Updated record with ID ${data.id}`);
      } else {
        await this.prisma.record.create({ data: mappedData });
        this.logger.log(`Created new record with ID ${data.id}`);
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
          this.logger.log(`Sent alert ${payload.alert} to external API`);
        } catch (err: unknown) {
          if (err instanceof Error) {
            this.logger.error(
              `Error sending alert ${payload.alert}: ${err.message}`,
            );
          } else {
            this.logger.error(
              `Error sending alert ${payload.alert}: unknown error`,
            );
          }
        }
      }

      return { success: true };
    } catch (err) {
      this.logger.error('Failed to update status', err);
      throw err instanceof BadRequestException
        ? err
        : new InternalServerErrorException('Failed to update status');
    }
  }

  @Cron(CronExpression.EVERY_MINUTE)
  async handleStatusCron() {
    this.logger.log('Running status cron job...');

    const now = new Date();

    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
    await this.prisma.record.updateMany({
      where: { status: 1, create_date: { lt: oneHourAgo } },
      data: { status: 2 },
    });
    this.logger.log('Updated records from "open" to "active"');

    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    await this.prisma.record.updateMany({
      where: { create_date: { lt: oneDayAgo } },
      data: { status: 5 },
    });
    this.logger.log('Updated old records to "closed"');

    this.logger.log('Status cron job finished.');
  }
}
