/**
 * useBooking Composable 测试
 *
 * 测试覆盖：
 * 1. 创建预约
 * 2. 取消预约
 * 3. 签到
 * 4. 签退
 * 5. 获取预约列表
 * 6. 异常处理
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { useBooking } from '@/composables/useBooking';
import { useUserStore } from '@/stores/user';
import { useBookingStore } from '@/stores/booking';
import type { IHttp } from '@/adapters';
import type { Booking, CreateBookingDTO } from '@/types';

// Mock stores
vi.mock('@/stores/user');
vi.mock('@/stores/booking');

describe('useBooking', () => {
  let mockHttp: IHttp;
  let mockUserStore: any;
  let mockBookingStore: any;

  beforeEach(() => {
    vi.clearAllMocks();

    // 创建 Mock HTTP 适配器
    mockHttp = {
      get: vi.fn(),
      post: vi.fn(),
      put: vi.fn(),
      delete: vi.fn(),
    } as unknown as IHttp;

    // Mock userStore
    mockUserStore = {
      isAuthenticated: true,
      user: {
        id: 'user-123',
        phone: '13800138000',
        nickname: '测试用户',
        level: 'NORMAL' as const,
        points: 100,
      },
      deductPoints: vi.fn(),
    };

    // Mock bookingStore
    mockBookingStore = {
      bookings: [] as Booking[],
      currentBooking: null as Booking | null,
      createBooking: vi.fn(),
      cancelBooking: vi.fn(),
      checkIn: vi.fn(),
      checkOut: vi.fn(),
      fetchBookings: vi.fn(),
    };

    vi.mocked(useUserStore).mockReturnValue(mockUserStore);
    vi.mocked(useBookingStore).mockReturnValue(mockBookingStore);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('createBooking', () => {
    it('应该成功创建预约', async () => {
      const mockBooking: Booking = {
        id: 'booking-123',
        userId: 'user-123',
        zoneId: 'zone-1',
        zoneName: '2F 静音研讨区',
        seatId: 'seat-1',
        seatLabel: 'A1',
        bookingDate: '2026-01-25',
        startTime: '14:00',
        endTime: '18:00',
        status: 'CONFIRMED',
        amount: 60,
        createdAt: '2026-01-24T10:00:00',
      };

      vi.mocked(mockHttp.post).mockResolvedValue(mockBooking);

      const { createBooking } = useBooking({ http: mockHttp });

      const dto: CreateBookingDTO = {
        seatId: 'seat-1',
        bookingDate: '2026-01-25',
        startTime: '14:00',
        endTime: '18:00',
      };

      const result = await createBooking(dto);

      expect(result).toEqual(mockBooking);
      expect(mockHttp.post).toHaveBeenCalledWith('/bookings', dto);
      expect(mockBookingStore.createBooking).toHaveBeenCalledWith(mockBooking);
    });

    it('应该拒绝未登录用户的预约请求', async () => {
      mockUserStore.isAuthenticated = false;

      const { createBooking } = useBooking({ http: mockHttp });

      await expect(
        createBooking({
          seatId: 'seat-1',
          bookingDate: '2026-01-25',
          startTime: '14:00',
          endTime: '18:00',
        })
      ).rejects.toThrow('用户未登录');

      expect(mockHttp.post).not.toHaveBeenCalled();
    });

    it('应该处理预约时间冲突', async () => {
      vi.mocked(mockHttp.post).mockRejectedValue(
        new Error('该时段已被预约')
      );

      const { createBooking } = useBooking({ http: mockHttp });

      await expect(
        createBooking({
          seatId: 'seat-1',
          bookingDate: '2026-01-25',
          startTime: '14:00',
          endTime: '18:00',
        })
      ).rejects.toThrow('该时段已被预约');
    });

    it('应该处理积分不足的情况', async () => {
      mockUserStore.user.points = 10;

      const { createBooking } = useBooking({ http: mockHttp });

      await expect(
        createBooking({
          seatId: 'seat-1',
          bookingDate: '2026-01-25',
          startTime: '14:00',
          endTime: '18:00',
        })
      ).rejects.toThrow();
    });
  });

  describe('cancelBooking', () => {
    it('应该成功取消预约', async () => {
      const mockResponse = {
        success: true,
        message: '预约已取消',
        refund: 30,
      };

      vi.mocked(mockHttp.delete).mockResolvedValue(mockResponse);

      const { cancelBooking } = useBooking({ http: mockHttp });

      await cancelBooking('booking-123');

      expect(mockHttp.delete).toHaveBeenCalledWith('/bookings/booking-123');
      expect(mockBookingStore.cancelBooking).toHaveBeenCalledWith('booking-123');
    });

    it('应该处理取消失败的预约', async () => {
      vi.mocked(mockHttp.delete).mockRejectedValue(
        new Error('预约已开始，无法取消')
      );

      const { cancelBooking } = useBooking({ http: mockHttp });

      await expect(cancelBooking('booking-123')).rejects.toThrow(
        '预约已开始，无法取消'
      );
    });

    it('应该处理不存在预约的取消请求', async () => {
      vi.mocked(mockHttp.delete).mockRejectedValue(new Error('预约不存在'));

      const { cancelBooking } = useBooking({ http: mockHttp });

      await expect(cancelBooking('invalid-id')).rejects.toThrow('预约不存在');
    });
  });

  describe('checkIn', () => {
    it('应该成功签到', async () => {
      const mockResponse: Booking = {
        id: 'booking-123',
        status: 'ACTIVE',
        userId: 'user-123',
        zoneId: 'zone-1',
        seatId: 'seat-1',
        bookingDate: '2026-01-25',
        startTime: '14:00',
        endTime: '18:00',
        checkInAt: new Date().toISOString(),
        amount: 60,
        createdAt: '2026-01-24T10:00:00',
      } as Booking;

      vi.mocked(mockHttp.post).mockResolvedValue(mockResponse);

      const { checkIn } = useBooking({ http: mockHttp });

      const result = await checkIn('booking-123');

      expect(result).toEqual(mockResponse);
      expect(mockHttp.post).toHaveBeenCalledWith('/bookings/booking-123/check-in');
      expect(mockBookingStore.checkIn).toHaveBeenCalledWith('booking-123');
    });

    it('应该处理重复签到', async () => {
      vi.mocked(mockHttp.post).mockRejectedValue(new Error('已经签到过了'));

      const { checkIn } = useBooking({ http: mockHttp });

      await expect(checkIn('booking-123')).rejects.toThrow('已经签到过了');
    });

    it('应该处理迟到签到', async () => {
      vi.mocked(mockHttp.post).mockRejectedValue(new Error('已超过签到时间'));

      const { checkIn } = useBooking({ http: mockHttp });

      await expect(checkIn('booking-123')).rejects.toThrow('已超过签到时间');
    });
  });

  describe('checkOut', () => {
    it('应该成功签退', async () => {
      const mockResponse: Booking = {
        id: 'booking-123',
        status: 'COMPLETED',
        userId: 'user-123',
        zoneId: 'zone-1',
        seatId: 'seat-1',
        bookingDate: '2026-01-25',
        startTime: '14:00',
        endTime: '18:00',
        checkInAt: '2026-01-25T14:00:00',
        checkOutAt: new Date().toISOString(),
        amount: 60,
        createdAt: '2026-01-24T10:00:00',
      } as Booking;

      vi.mocked(mockHttp.post).mockResolvedValue(mockResponse);

      const { checkOut } = useBooking({ http: mockHttp });

      const result = await checkOut('booking-123');

      expect(result).toEqual(mockResponse);
      expect(mockHttp.post).toHaveBeenCalledWith('/bookings/booking-123/check-out');
      expect(mockBookingStore.checkOut).toHaveBeenCalledWith('booking-123');
    });

    it('应该处理未签到就签退的情况', async () => {
      vi.mocked(mockHttp.post).mockRejectedValue(new Error('尚未签到'));

      const { checkOut } = useBooking({ http: mockHttp });

      await expect(checkOut('booking-123')).rejects.toThrow('尚未签到');
    });
  });

  describe('fetchBookings', () => {
    it('应该成功获取预约列表', async () => {
      const mockBookings: Booking[] = [
        {
          id: 'booking-1',
          userId: 'user-123',
          zoneId: 'zone-1',
          seatId: 'seat-1',
          bookingDate: '2026-01-25',
          startTime: '14:00',
          endTime: '18:00',
          status: 'CONFIRMED',
          amount: 60,
          createdAt: '2026-01-24T10:00:00',
        } as Booking,
        {
          id: 'booking-2',
          userId: 'user-123',
          zoneId: 'zone-2',
          seatId: 'seat-2',
          bookingDate: '2026-01-26',
          startTime: '09:00',
          endTime: '12:00',
          status: 'PENDING',
          amount: 45,
          createdAt: '2026-01-24T11:00:00',
        } as Booking,
      ];

      vi.mocked(mockHttp.get).mockResolvedValue(mockBookings);

      const { fetchBookings } = useBooking({ http: mockHttp });

      await fetchBookings();

      expect(mockHttp.get).toHaveBeenCalledWith('/bookings');
      expect(mockBookingStore.fetchBookings).toHaveBeenCalled();
    });

    it('应该处理空预约列表', async () => {
      vi.mocked(mockHttp.get).mockResolvedValue([]);

      const { fetchBookings } = useBooking({ http: mockHttp });

      await fetchBookings();

      expect(mockBookingStore.fetchBookings).toHaveBeenCalled();
    });

    it('应该处理网络错误', async () => {
      vi.mocked(mockHttp.get).mockRejectedValue(new Error('网络错误'));

      const { fetchBookings } = useBooking({ http: mockHttp });

      await expect(fetchBookings()).rejects.toThrow('网络错误');
    });
  });

  describe('计算属性', () => {
    it('bookings 应该返回预约列表', () => {
      const testBookings: Booking[] = [
        {
          id: 'booking-1',
          userId: 'user-123',
          zoneId: 'zone-1',
          seatId: 'seat-1',
          bookingDate: '2026-01-25',
          startTime: '14:00',
          endTime: '18:00',
          status: 'CONFIRMED',
          amount: 60,
          createdAt: '2026-01-24T10:00:00',
        } as Booking,
      ];

      mockBookingStore.bookings = testBookings;

      const { bookings } = useBooking({ http: mockHttp });

      expect(bookings.value).toEqual(testBookings);
    });

    it('currentBooking 应该返回当前进行中的预约', () => {
      const testCurrentBooking: Booking = {
        id: 'booking-active',
        status: 'ACTIVE',
        userId: 'user-123',
        zoneId: 'zone-1',
        seatId: 'seat-1',
        bookingDate: '2026-01-25',
        startTime: '14:00',
        endTime: '18:00',
        amount: 60,
        createdAt: '2026-01-24T10:00:00',
      } as Booking;

      mockBookingStore.currentBooking = testCurrentBooking;

      const { currentBooking } = useBooking({ http: mockHttp });

      expect(currentBooking.value).toEqual(testCurrentBooking);
    });
  });
});
