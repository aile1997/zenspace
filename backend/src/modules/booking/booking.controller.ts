import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Body,
  Query,
  UseGuards,
  HttpCode,
} from '@nestjs/common';
import { BookingService } from './booking.service';
import { CreateBookingDto } from './dto/create-booking.dto';
import { GetBookingsQueryDto } from './dto/get-bookings-query.dto';
import { JwtAuthGuard } from '@modules/auth/guards/jwt-auth.guard';
import { CurrentUser } from '@common/decorators/current-user.decorator';
import { AuthUserInfo } from '@modules/auth/types/auth.types';

/**
 * 预约控制器
 *
 * 处理所有预约相关的 API 端点
 */
@Controller('booking')
export class BookingController {
  constructor(private readonly bookingService: BookingService) {}

  /**
   * 获取区域列表（带实时占用率）
   *
   * GET /api/zones
   */
  @Get('zones')
  @HttpCode(200)
  async getZones() {
    const zones = await this.bookingService.getZonesWithOccupancy();
    return { zones };
  }

  /**
   * 获取区域座位列表
   *
   * GET /api/zones/:zoneId/seats
   */
  @Get('zones/:zoneId/seats')
  @HttpCode(200)
  async getZoneSeats(@Param('zoneId') zoneId: string) {
    return this.bookingService.getZoneSeats(zoneId);
  }

  /**
   * 创建预约
   *
   * POST /api/bookings
   *
   * 需要认证
   */
  @Post('bookings')
  @UseGuards(JwtAuthGuard)
  @HttpCode(200)
  async createBooking(
    @CurrentUser() user: AuthUserInfo,
    @Body() dto: CreateBookingDto,
  ) {
    const booking = await this.bookingService.createBooking(user, dto);
    return { booking };
  }

  /**
   * 查询我的预约
   *
   * GET /api/bookings/my
   *
   * 需要认证
   */
  @Get('bookings/my')
  @UseGuards(JwtAuthGuard)
  @HttpCode(200)
  async getMyBookings(
    @CurrentUser() user: AuthUserInfo,
    @Query() query: GetBookingsQueryDto,
  ) {
    return this.bookingService.getMyBookings(user.id, query);
  }

  /**
   * 取消预约
   *
   * DELETE /api/bookings/:id
   *
   * 需要认证
   */
  @Delete('bookings/:id')
  @UseGuards(JwtAuthGuard)
  @HttpCode(200)
  async cancelBooking(
    @CurrentUser() user: AuthUserInfo,
    @Param('id') bookingId: string,
  ) {
    return this.bookingService.cancelBooking(user, bookingId);
  }
}
