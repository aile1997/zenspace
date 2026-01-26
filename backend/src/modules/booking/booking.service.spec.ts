import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, ForbiddenException } from '@nestjs/common';
import { BookingService } from './booking.service';
import { PrismaService } from '@prisma/prisma.service';
import { CreateBookingDto } from './dto/create-booking.dto';
import { AuthUserInfo } from '@modules/auth/types/auth.types';

/**
 * BookingService 单元测试
 *
 * 测试预约服务的业务逻辑
 */
describe('BookingService', () => {
  let service: BookingService;
  let prisma: jest.Mocked<PrismaService>;

  // Mock PrismaService
  const mockPrismaService = {
    zone: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
    },
    seat: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
    },
    booking: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      count: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
    user: {
      findUnique: jest.fn(),
    },
  } as unknown as jest.Mocked<PrismaService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BookingService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<BookingService>(BookingService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getZonesWithOccupancy', () => {
    /**
     * 测试用例 1.1: 成功获取区域列表并计算占用率
     */
    it('应该成功返回区域列表及占用率', async () => {
      const mockZones = [
        {
          id: 'zone-1f',
          name: '1F 综合阅览区',
          floor: 1,
          description: '开放空间',
          capacity: null,
          hourlyPrice: 10,
          features: ['WiFi', '电源'],
          openTime: '08:00',
          closeTime: '22:00',
          seats: [
            { status: 'AVAILABLE' },
            { status: 'AVAILABLE' },
            { status: 'OCCUPIED' },
            { status: 'OCCUPIED' },
          ],
        },
      ];

      mockPrismaService.zone.findMany = jest.fn().mockResolvedValue(mockZones);

      const result = await service.getZonesWithOccupancy();

      expect(result).toHaveLength(1);
      expect(result[0]).toMatchObject({
        id: 'zone-1f',
        name: '1F 综合阅览区',
        capacity: 4,
        availableSeats: 2,
        occupancyRate: 50.0,
        status: 'MODERATE',
      });
    });

    /**
     * 测试用例 1.2: 空座位时占用率为 0
     */
    it('空座位时占用率应为 0', async () => {
      mockPrismaService.zone.findMany = jest.fn().mockResolvedValue([
        {
          id: 'zone-2f',
          name: '2F 安静区',
          floor: 2,
          description: '安静区域',
          capacity: null,
          hourlyPrice: 15,
          features: [],
          openTime: '08:00',
          closeTime: '22:00',
          seats: [],
        },
      ]);

      const result = await service.getZonesWithOccupancy();

      expect(result[0]).toMatchObject({
        capacity: 0,
        availableSeats: 0,
        occupancyRate: 0,
        status: 'AVAILABLE',
      });
    });
  });

  describe('getZoneSeats', () => {
    /**
     * 测试用例 2.1: 成功获取区域座位列表
     */
    it('应该成功返回座位列表', async () => {
      const mockZone = {
        id: 'zone-1f',
        name: '1F 综合阅览区',
      };

      const mockSeats = [
        {
          id: 'seat-1',
          x: 0,
          y: 0,
          label: 'A1',
          type: 'STANDARD',
          status: 'AVAILABLE',
          zoneId: 'zone-1f',
          bookings: [],
        },
        {
          id: 'seat-2',
          x: 1,
          y: 0,
          label: 'A2',
          type: 'WINDOW',
          status: 'OCCUPIED',
          zoneId: 'zone-1f',
          bookings: [
            {
              id: 'booking-1',
              startTime: '14:00',
              endTime: '16:00',
              status: 'CONFIRMED',
              bookingDate: new Date('2026-01-26'),
            },
          ],
        },
      ];

      mockPrismaService.zone.findUnique = jest.fn().mockResolvedValue(mockZone);
      mockPrismaService.seat.findMany = jest.fn().mockResolvedValue(mockSeats);

      const result = await service.getZoneSeats('zone-1f');

      expect(result.zone).toEqual(mockZone);
      expect(result.seats).toHaveLength(2);
      expect(result.seats[0]).toMatchObject({
        id: 'seat-1',
        label: 'A1',
        status: 'AVAILABLE',
      });
      expect(result.seats[1]).toMatchObject({
        id: 'seat-2',
        label: 'A2',
        status: 'OCCUPIED',
      });
    });

    /**
     * 测试用例 2.2: 区域不存在时抛出错误
     */
    it('应该在区域不存在时抛出错误', async () => {
      mockPrismaService.zone.findUnique = jest.fn().mockResolvedValue(null);

      await expect(service.getZoneSeats('invalid-zone')).rejects.toThrow(
        new BadRequestException('区域不存在'),
      );
    });
  });

  describe('createBooking', () => {
    const mockUser: AuthUserInfo = {
      id: 'user-123',
      phone: '13800138000',
      nickname: '测试用户',
      avatar: null,
      level: 'NORMAL',
      points: 0,
      creditScore: 100,
    };

    const mockDto: CreateBookingDto = {
      seatId: 'seat-1',
      startTime: '2026-01-27T14:00:00Z',
      duration: 2,
    };

    /**
     * 测试用例 3.1: 成功创建预约
     */
    it('应该成功创建预约', async () => {
      const mockSeat = {
        id: 'seat-1',
        x: 0,
        y: 0,
        label: 'A1',
        type: 'STANDARD',
        status: 'AVAILABLE',
        zoneId: 'zone-1f',
        zone: {
          hourlyPrice: 10,
        },
      };

      const mockBooking = {
        id: 'booking-123',
        userId: 'user-123',
        seatId: 'seat-1',
        bookingDate: new Date('2026-01-27'),
        startTime: '14:00',
        endTime: '16:00',
        status: 'PENDING',
        amount: 20,
        seat: mockSeat,
      };

      mockPrismaService.seat.findUnique = jest.fn().mockResolvedValue(mockSeat);
      mockPrismaService.booking.findMany = jest.fn().mockResolvedValue([]);
      mockPrismaService.booking.create = jest.fn().mockResolvedValue(mockBooking);

      const result = await service.createBooking(mockUser, mockDto);

      expect(result.id).toBe('booking-123');
      expect(result.userId).toBe(mockUser.id);
      expect(result.seatId).toBe(mockDto.seatId);
      expect(result.status).toBe('PENDING');

      expect(mockPrismaService.booking.create).toHaveBeenCalled();
    });

    /**
     * 测试用例 3.2: 座位不存在时抛出错误
     */
    it('应该在座位不存在时抛出错误', async () => {
      mockPrismaService.seat.findUnique = jest.fn().mockResolvedValue(null);

      await expect(
        service.createBooking(mockUser, mockDto),
      ).rejects.toThrow(new BadRequestException('座位不存在'));
    });

    /**
     * 测试用例 3.3: 座位已被预约时抛出错误
     */
    it('应该在座位已被预约时抛出错误', async () => {
      const mockSeat = {
        id: 'seat-1',
        zone: { hourlyPrice: 10 },
      };

      mockPrismaService.seat.findUnique = jest.fn().mockResolvedValue(mockSeat);
      mockPrismaService.booking.findMany = jest.fn().mockResolvedValue([
        { id: 'existing-booking' },
      ]);

      await expect(
        service.createBooking(mockUser, mockDto),
      ).rejects.toThrow(new BadRequestException('该时段座位已被预约'));
    });
  });

  describe('cancelBooking', () => {
    const mockUser: AuthUserInfo = {
      id: 'user-123',
      phone: '13800138000',
      nickname: '测试用户',
      avatar: null,
      level: 'NORMAL',
      points: 0,
      creditScore: 100,
    };

    /**
     * 测试用例 4.1: 成功取消预约
     */
    it('应该成功取消预约', async () => {
      const futureDate = new Date();
      futureDate.setHours(futureDate.getHours() + 2);

      const mockBooking = {
        id: 'booking-123',
        userId: 'user-123',
        bookingDate: futureDate,
        startTime: '14:00',
        endTime: '16:00',
        status: 'PENDING',
        amount: 20,
      };

      mockPrismaService.booking.findUnique = jest.fn().mockResolvedValue(mockBooking);
      mockPrismaService.booking.update = jest.fn().mockResolvedValue({});

      const result = await service.cancelBooking(mockUser, 'booking-123');

      expect(result).toMatchObject({
        message: '预约已取消',
        refund: 20,
      });
      expect(mockPrismaService.booking.update).toHaveBeenCalledWith({
        where: { id: 'booking-123' },
        data: { status: 'CANCELLED' },
      });
    });

    /**
     * 测试用例 4.2: 无权取消他人预约
     */
    it('应该在取消他人预约时抛出错误', async () => {
      const otherUserBooking = {
        id: 'booking-456',
        userId: 'user-456',
        status: 'PENDING',
      };

      mockPrismaService.booking.findUnique = jest.fn().mockResolvedValue(otherUserBooking);

      await expect(
        service.cancelBooking(mockUser, 'booking-456'),
      ).rejects.toThrow(new ForbiddenException('无权取消此预约'));
    });

    /**
     * 测试用例 4.3: 预约已取消时抛出错误
     */
    it('应该在预约已取消时抛出错误', async () => {
      const cancelledBooking = {
        id: 'booking-789',
        userId: 'user-123',
        status: 'CANCELLED',
      };

      mockPrismaService.booking.findUnique = jest.fn().mockResolvedValue(cancelledBooking);

      await expect(
        service.cancelBooking(mockUser, 'booking-789'),
      ).rejects.toThrow(new BadRequestException('预约已取消'));
    });

    /**
     * 测试用例 4.4: 临近开始时间无法取消
     */
    it('应该在临近开始时间时无法取消', async () => {
      const pastBooking = {
        id: 'booking-999',
        userId: 'user-123',
        bookingDate: new Date('2026-01-26'),
        startTime: '10:00',
        endTime: '12:00',
        status: 'PENDING',
        amount: 20,
      };

      mockPrismaService.booking.findUnique = jest.fn().mockResolvedValue(pastBooking);

      await expect(
        service.cancelBooking(mockUser, 'booking-999'),
      ).rejects.toThrow(new BadRequestException('预约开始前 1 小时内无法取消'));
    });
  });
});
