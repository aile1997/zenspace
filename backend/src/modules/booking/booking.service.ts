import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateBookingDto } from './dto/create-booking.dto';
import { BookingStatus, SeatStatus } from '@prisma/client';

/**
 * 预约业务服务
 */
@Injectable()
export class BookingService {
  constructor(private prisma: PrismaService) {}

  /**
   * 获取所有区域（含实时占用率）
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
    });

    return zones.map((zone) => {
      const totalSeats = zone.seats.length;
      const availableSeats = zone.seats.filter(
        (s) => s.status === SeatStatus.AVAILABLE,
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
        capacity: totalSeats,
        availableSeats,
        occupancyRate,
        status: this.calculateZoneStatus(occupancyRate),
        hourlyPrice: zone.hourlyPrice,
        tags: zone.tags,
        imageUrl: zone.imageUrl,
      };
    });
  }

  /**
   * 获取区域内的所有座位
   */
  async getZoneSeats(zoneId: string, bookingDate: string) {
    const zone = await this.prisma.zone.findUnique({
      where: { id: zoneId },
      select: { id: true, name: true, floor: true },
    });

    if (!zone) {
      throw new NotFoundException('区域不存在');
    }

    const seats = await this.prisma.seat.findMany({
      where: { zoneId },
      include: {
        bookings: {
          where: {
            bookingDate: new Date(bookingDate),
            status: {
              in: [BookingStatus.CONFIRMED, BookingStatus.ACTIVE],
            },
          },
        },
      },
      orderBy: [{ y: 'asc' }, { x: 'asc' }],
    });

    return {
      zone,
      seats: seats.map((seat) => ({
        id: seat.id,
        label: seat.label,
        type: seat.type,
        status: seat.status,
        x: seat.x,
        y: seat.y,
        bookings: seat.bookings.map((b) => ({
          startTime: b.startTime,
          endTime: b.endTime,
        })),
      })),
    };
  }

  /**
   * 创建预约
   */
  async createBooking(userId: string, dto: CreateBookingDto) {
    // 检查座位是否存在
    const seat = await this.prisma.seat.findUnique({
      where: { id: dto.seatId },
      include: { zone: true },
    });

    if (!seat) {
      throw new NotFoundException('座位不存在');
    }

    if (seat.status !== SeatStatus.AVAILABLE) {
      throw new BadRequestException('座位当前不可用');
    }

    // 计算结束时间
    const endTime = this.calculateEndTime(dto.startTime, dto.duration);

    // 检查时段冲突
    const conflictBooking = await this.prisma.booking.findFirst({
      where: {
        seatId: dto.seatId,
        bookingDate: new Date(dto.bookingDate),
        status: {
          in: [BookingStatus.CONFIRMED, BookingStatus.ACTIVE],
        },
        OR: [
          {
            AND: [
              { startTime: { lte: dto.startTime } },
              { endTime: { gt: dto.startTime } },
            ],
          },
          {
            AND: [
              { startTime: { lt: endTime } },
              { endTime: { gte: endTime } },
            ],
          },
          {
            AND: [
              { startTime: { gte: dto.startTime } },
              { endTime: { lte: endTime } },
            ],
          },
        ],
      },
    });

    if (conflictBooking) {
      throw new BadRequestException('该时段已被预约');
    }

    // 计算金额
    const amount = seat.zone.hourlyPrice.toNumber() * dto.duration;

    // 创建预约
    const booking = await this.prisma.booking.create({
      data: {
        userId,
        seatId: dto.seatId,
        bookingDate: new Date(dto.bookingDate),
        startTime: dto.startTime,
        endTime,
        status: BookingStatus.CONFIRMED,
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

    return {
      id: booking.id,
      seat: {
        id: booking.seat.id,
        label: booking.seat.label,
        zone: {
          name: booking.seat.zone.name,
          floor: booking.seat.zone.floor,
        },
      },
      bookingDate: booking.bookingDate,
      startTime: booking.startTime,
      endTime: booking.endTime,
      status: booking.status,
      amount: booking.amount,
    };
  }

  /**
   * 获取我的预约列表
   */
  async getMyBookings(
    userId: string,
    status?: BookingStatus,
    page = 1,
    limit = 20,
  ) {
    const where = {
      userId,
      ...(status && { status }),
    };

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
        orderBy: { bookingDate: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.booking.count({ where }),
    ]);

    return {
      bookings: bookings.map((booking) => ({
        id: booking.id,
        seat: {
          label: booking.seat.label,
          zone: {
            name: booking.seat.zone.name,
            floor: booking.seat.zone.floor,
          },
        },
        bookingDate: booking.bookingDate,
        startTime: booking.startTime,
        endTime: booking.endTime,
        status: booking.status,
        amount: booking.amount,
        canCancel: this.canCancelBooking(booking.bookingDate, booking.startTime),
      })),
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * 取消预约
   */
  async cancelBooking(userId: string, bookingId: string) {
    const booking = await this.prisma.booking.findUnique({
      where: { id: bookingId },
    });

    if (!booking) {
      throw new NotFoundException('预约不存在');
    }

    if (booking.userId !== userId) {
      throw new ForbiddenException('无权取消此预约');
    }

    if (booking.status !== BookingStatus.CONFIRMED) {
      throw new BadRequestException('当前状态无法取消');
    }

    // 检查是否可取消（开始前1小时）
    if (!this.canCancelBooking(booking.bookingDate, booking.startTime)) {
      throw new BadRequestException('预约开始前1小时内无法取消');
    }

    // 取消预约
    await this.prisma.booking.update({
      where: { id: bookingId },
      data: { status: BookingStatus.CANCELLED },
    });

    return {
      message: '预约已取消',
      refund: booking.amount,
    };
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
   * 计算结束时间
   */
  private calculateEndTime(startTime: string, duration: number): string {
    const [hours, minutes] = startTime.split(':').map(Number);
    const totalMinutes = hours * 60 + minutes + duration * 60;
    const endHours = Math.floor(totalMinutes / 60) % 24;
    const endMinutes = totalMinutes % 60;
    return `${String(endHours).padStart(2, '0')}:${String(endMinutes).padStart(2, '0')}`;
  }

  /**
   * 判断是否可取消预约
   */
  private canCancelBooking(bookingDate: Date, startTime: string): boolean {
    const now = new Date();
    const [hours, minutes] = startTime.split(':').map(Number);

    const bookingDateTime = new Date(bookingDate);
    bookingDateTime.setHours(hours, minutes, 0, 0);

    const oneHourBefore = new Date(bookingDateTime.getTime() - 60 * 60 * 1000);

    return now < oneHourBefore;
  }
}
