import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class StatusService {
  private readonly logger = new Logger(StatusService.name);

  constructor(private readonly prisma: PrismaService) {}

  async checkDb(): Promise<boolean> {
    const maxRetries = 2;
    const timeoutMs = 2000;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        this.logger.log(`DB ping attempt ${attempt + 1}`);

        await Promise.race([
          // eslint-disable-next-line @typescript-eslint/no-unsafe-call
          await this.prisma.$queryRaw`SELECT 1`,
          new Promise((_res, rej) =>
            setTimeout(() => rej(new Error('DB ping timeout')), timeoutMs),
          ),
        ]);

        this.logger.log('DB ping succeeded');
        return true;
      } catch (err: unknown) {
        if (err instanceof Error) {
          this.logger.warn(
            `DB ping failed (attempt ${attempt + 1}): ${err?.message ?? err}`,
          );

          if (attempt === maxRetries) {
            this.logger.error(
              'Database unavailable after retries',
              (err && err.stack) ?? String(err),
            );
            return false;
          }
        } else {
          const errStr = JSON.stringify(err);
          this.logger.warn(
            `DB ping failed (attempt ${attempt + 1}): ${errStr}`,
          );
          if (attempt === maxRetries) {
            this.logger.error('Database unavailable after retries', errStr);
            return false;
          }
        }

        const backoffMs = 300 * (attempt + 1);
        await new Promise((res) => setTimeout(res, backoffMs));
      }
    }

    return false;
  }
}
