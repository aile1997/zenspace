import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { RedisModule } from './redis/redis.module';
import { AuthModule } from './modules/auth/auth.module';
import { BookingModule } from './modules/booking/booking.module';

@Module({
  imports: [PrismaModule, RedisModule, AuthModule, BookingModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
