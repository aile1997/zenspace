import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { BookingService } from './booking.service';
import { CreateBookingDto } from './dto/create-booking.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { User, BookingStatus } from '@prisma/client';

/**
 * 预约控制器
 */
@Controller('bookings')
export class BookingController {
  constructor(private bookingService: BookingService) {}

  /**
   * 获取区域列表（含实时占用率）
   */
  @Get('zones')
  async getZones() {
    const zones = await this.bookingService.getZonesWithOccupancy();
    return { zones };
  }

  /**
   * 获取区域内的座位列表
   */
  @Get('zones/:zoneId/seats')
  async getZoneSeats(
    @Param('zoneId') zoneId: string,
    @Query('date') date: string,
  ) {
    // 默认查询今天
    const bookingDate = date || new Date().toISOString().split('T')[0];
    return await this.bookingService.getZoneSeats(zoneId, bookingDate);
  }

  /**
   * 创建预约
   */
  @Post()
  @UseGuards(JwtAuthGuard)
  async createBooking(
    @CurrentUser() user: User,
    @Body() dto: CreateBookingDto,
  ) {
    const booking = await this.bookingService.createBooking(user.id, dto);
    return { booking };
  }

  /**
   * 获取我的预约列表
   */
  @Get('my')
  @UseGuards(JwtAuthGuard)
  async getMyBookings(
    @CurrentUser() user: User,
    @Query('status') status?: BookingStatus,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return await this.bookingService.getMyBookings(
      user.id,
      status,
      page ? parseInt(page) : 1,
      limit ? parseInt(limit) : 20,
    );
  }

  /**
   * 取消预约
   */
  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  async cancelBooking(@CurrentUser() user: User, @Param('id') bookingId: string) {
    return await this.bookingService.cancelBooking(user.id, bookingId);
  }
}
