import {
  Injectable,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '@prisma/prisma.service';
import { CreateBookingDto } from './dto/create-booking.dto';
import { AuthUserInfo } from '@modules/auth/types/auth.types';

/**
 * 预约服务
 *
 * 处理座位预约的业务逻辑
 */
@Injectable()
export class BookingService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * 获取所有区域（带占用率）
   */
  async getZonesWithOccupancy() {
    const zones = await this.prisma.zone.findMany({
      include: {
        seats: {
          select: {
            status: true,
          },
        },
      },
      orderBy: {
        floor: 'asc',
      },
    });

    return zones.map((zone) => {
      const totalSeats = zone.seats.length;
      const availableSeats = zone.seats.filter(
        (s) => s.status === 'AVAILABLE',
      ).length;
      const occupancyRate =
        totalSeats > 0
          ? parseFloat(
              (((totalSeats - availableSeats) / totalSeats) * 100).toFixed(2),
            )
          : 0;

      return {
        id: zone.id,
        name: zone.name,
        floor: zone.floor,
        description: zone.description,
        capacity: totalSeats,
        availableSeats,
        occupancyRate,
        status: this.calculateZoneStatus(occupancyRate),
        hourlyPrice: Number(zone.hourlyPrice),
        features: zone.tags || [],  // 将 tags 映射为 features
        openTime: zone.openTime || '08:00',
        closeTime: zone.closeTime || '22:00',
        imageUrl: zone.imageUrl,
      };
    });
  }

  /**
   * 获取区域座位列表
   */
  async getZoneSeats(zoneId: string) {
    const zone = await this.prisma.zone.findUnique({
      where: { id: zoneId },
      select: { id: true, name: true },
    });

    if (!zone) {
      throw new BadRequestException('区域不存在');
    }

    const seats = await this.prisma.seat.findMany({
      where: { zoneId },
      include: {
        bookings: {
          where: {
            status: { in: ['CONFIRMED', 'ACTIVE'] },
          },
          orderBy: { bookingDate: 'desc' },
          take: 1,
        },
      },
      orderBy: [{ x: 'asc' }, { y: 'asc' }],
    });

    return {
      zone,
      seats: seats.map((seat) => {
        const status = this.calculateSeatStatus(seat.bookings);
        return {
          id: seat.id,
          row: String.fromCharCode(65 + seat.y),  // 将 y 映射为行号 A, B, C...
          column: seat.x + 1,                      // 将 x 映射为列号 1, 2, 3...
          number: seat.label,
          status: status === 'available' ? 'available' : 'occupied',
          type: seat.type,
          features: [],  // 座位特色可以后续从数据库添加
          currentBooking: seat.bookings[0] ? {
            endTime: `${seat.bookings[0].bookingDate}T${seat.bookings[0].endTime}:00`,
          } : null,
        };
      }),
    };
  }

  /**
   * 创建预约
   */
  async createBooking(user: AuthUserInfo, dto: CreateBookingDto) {
    // 1. 检查座位是否存在
    const seat = await this.prisma.seat.findUnique({
      where: { id: dto.seatId },
      include: {
        zone: true,
      },
    });

    if (!seat) {
      throw new BadRequestException('座位不存在');
    }

    // 2. 解析开始时间
    const startDate = new Date(dto.startTime);
    const startTimeStr = this.formatTime(
      startDate.getHours(),
      startDate.getMinutes(),
    );

    // 3. 计算结束时间
    const endDate = new Date(
      startDate.getTime() + dto.duration * 60 * 60 * 1000,
    );
    const endTimeStr = this.formatTime(
      endDate.getHours(),
      endDate.getMinutes(),
    );

    // 4. 检查座位是否可用
    const isAvailable = await this.checkSeatAvailability(
      dto.seatId,
      startDate,
      endDate,
    );

    if (!isAvailable) {
      throw new BadRequestException('该时段座位已被预约');
    }

    // 5. 计算价格
    const hourlyPrice = Number(seat.zone.hourlyPrice);
    const amount = await this.calculatePrice(hourlyPrice, dto.duration);

    // 6. 创建预约
    const booking = await this.prisma.booking.create({
      data: {
        userId: user.id,
        seatId: dto.seatId,
        bookingDate: startDate,
        startTime: startTimeStr,
        endTime: endTimeStr,
        status: 'PENDING',
        amount,
      },
      include: {
        seat: {
          include: {
            zone: true,
          },
        },
      },
    });

    return booking;
  }

  /**
   * 查询我的预约
   */
  async getMyBookings(
    userId: string,
    query: {
      status?: string;
      page?: number;
      limit?: number;
    },
  ) {
    const where: any = { userId };

    if (query.status) {
      where.status = query.status;
    }

    const skip = ((query.page || 1) - 1) * (query.limit || 20);

    const [bookings, total] = await Promise.all([
      this.prisma.booking.findMany({
        where,
        include: {
          seat: {
            include: {
              zone: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: query.limit || 20,
      }),
      this.prisma.booking.count({ where }),
    ]);

    // 添加 canCancel 标记和转换 amount
    const bookingsWithCanCancel = bookings.map((booking) => ({
      ...booking,
      amount: Number(booking.amount),
      canCancel: this.canCancelBooking(booking),
    }));

    return {
      bookings: bookingsWithCanCancel,
      pagination: {
        total,
        page: query.page || 1,
        limit: query.limit || 20,
        totalPages: Math.ceil(total / (query.limit || 20)),
      },
    };
  }

  /**
   * 取消预约
   */
  async cancelBooking(user: AuthUserInfo, bookingId: string) {
    const booking = await this.prisma.booking.findUnique({
      where: { id: bookingId },
    });

    if (!booking) {
      throw new BadRequestException('预约不存在');
    }

    // 检查权限
    if (booking.userId !== user.id) {
      throw new ForbiddenException('无权取消此预约');
    }

    // 检查状态
    if (booking.status === 'CANCELLED') {
      throw new BadRequestException('预约已取消');
    }

    if (booking.status === 'COMPLETED') {
      throw new BadRequestException('预约已结束，无法取消');
    }

    // 检查是否可取消（提前1小时）
    const now = new Date();
    const bookingDateTime = new Date(booking.bookingDate);
    const [startHour, startMinute] = booking.startTime.split(':').map(Number);
    bookingDateTime.setHours(startHour, startMinute, 0, 0);
    const oneHourBefore = new Date(bookingDateTime.getTime() - 60 * 60 * 1000);

    if (now > oneHourBefore) {
      throw new BadRequestException('预约开始前 1 小时内无法取消');
    }

    // 取消预约
    await this.prisma.booking.update({
      where: { id: bookingId },
      data: { status: 'CANCELLED' },
    });

    return {
      message: '预约已取消',
      refund: Number(booking.amount),
    };
  }

  /**
   * 检查座位在指定时段是否可用
   */
  private async checkSeatAvailability(
    seatId: string,
    startDate: Date,
    endDate: Date,
  ): Promise<boolean> {
    // 查询同一天的所有预约
    const bookingDateStr = startDate.toISOString().split('T')[0];

    const conflictingBookings = await this.prisma.booking.findMany({
      where: {
        seatId,
        bookingDate: new Date(bookingDateStr),
        status: { in: ['CONFIRMED', 'ACTIVE'] },
        OR: [
          {
            // 现有预约的开始时间在新预约结束时间之前，结束时间在新预约开始时间之后
            AND: [
              {
                startTime: {
                  lt: this.formatTime(endDate.getHours(), endDate.getMinutes()),
                },
              },
              {
                endTime: {
                  gt: this.formatTime(
                    startDate.getHours(),
                    startDate.getMinutes(),
                  ),
                },
              },
            ],
          },
        ],
      },
    });

    return conflictingBookings.length === 0;
  }

  /**
   * 计算价格
   */
  private async calculatePrice(
    hourlyPrice: number,
    duration: number,
  ): Promise<number> {
    return hourlyPrice * duration;
  }

  /**
   * 格式化时间为 HH:mm 格式
   */
  private formatTime(hour: number, minute: number): string {
    const h = hour.toString().padStart(2, '0');
    const m = minute.toString().padStart(2, '0');
    return `${h}:${m}`;
  }

  /**
   * 计算区域状态
   */
  private calculateZoneStatus(occupancyRate: number): string {
    if (occupancyRate >= 80) return 'BUSY';
    if (occupancyRate >= 50) return 'MODERATE';
    return 'AVAILABLE';
  }

  /**
   * 计算座位状态
   */
  private calculateSeatStatus(bookings: any[]): string {
    if (!bookings || bookings.length === 0) {
      return 'AVAILABLE';
    }
    return 'OCCUPIED';
  }

  /**
   * 判断预约是否可以取消
   */
  private canCancelBooking(booking: any): boolean {
    if (booking.status !== 'PENDING' && booking.status !== 'CONFIRMED') {
      return false;
    }

    const now = new Date();
    const bookingDateTime = new Date(booking.bookingDate);
    const [startHour, startMinute] = booking.startTime.split(':').map(Number);
    bookingDateTime.setHours(startHour, startMinute, 0, 0);
    const oneHourBefore = new Date(bookingDateTime.getTime() - 60 * 60 * 1000);

    return now <= oneHourBefore;
  }
}
