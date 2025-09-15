import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { StatusModule } from './status/status.module';
import { PrismaModule } from './prisma/prisma.module';

@Module({
  imports: [PrismaModule, StatusModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
