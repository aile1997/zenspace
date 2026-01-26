import { Module } from '@nestjs/common';
import { BookingController } from './booking.controller';
import { BookingService } from './booking.service';
import { PrismaModule } from '@prisma/prisma.module';
import { JwtAuthGuard } from '@modules/auth/guards/jwt-auth.guard';

/**
 * 预约模块
 *
 * 处理座位预约相关功能
 */
@Module({
  imports: [PrismaModule],
  controllers: [BookingController],
  providers: [BookingService, JwtAuthGuard],
  exports: [BookingService],
})
export class BookingModule {}
