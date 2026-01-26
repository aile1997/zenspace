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
import { createPinia, setActivePinia } from 'pinia';
import { useBooking } from '@/composables/useBooking';
import { useUserStore } from '@/stores/user';
import { useBookingStore } from '@/stores/booking';
import { useToastStore } from '@/stores/toast';
import type { IHttp } from '@/adapters';
import type { Booking, CreateBookingDTO } from '@/types';

// Mock stores
vi.mock('@/stores/user');
vi.mock('@/stores/booking');
vi.mock('@/stores/toast');

describe('useBooking', () => {
  let mockHttp: IHttp;
  let mockUserStore: any;
  let mockBookingStore: any;
  let mockToastStore: any;

  beforeEach(() => {
    // 初始化 Pinia
    setActivePinia(createPinia());

    vi.clearAllMocks();

    // 创建 Mock HTTP 适配器
    mockHttp = {
      get: vi.fn(),
      post: vi.fn(),
      put: vi.fn(),
      delete: vi.fn(),
    } as unknown as IHttp;

    // Mock toastStore
    mockToastStore = {
      showSuccess: vi.fn(),
      showError: vi.fn(),
      showInfo: vi.fn(),
      toast: null,
    };

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
      createBooking: vi.fn().mockResolvedValue({ id: 'booking-123' } as Booking),
      cancelBooking: vi.fn().mockResolvedValue(undefined),
      checkIn: vi.fn().mockResolvedValue({ id: 'booking-123' } as Booking),
      checkOut: vi.fn().mockResolvedValue({ id: 'booking-123' } as Booking),
      fetchBookings: vi.fn().mockResolvedValue(undefined),
    };

    vi.mocked(useToastStore).mockReturnValue(mockToastStore);
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

      mockBookingStore.createBooking.mockResolvedValue(mockBooking);

      const { createBooking } = useBooking({ http: mockHttp });

      const dto: CreateBookingDTO = {
        seatId: 'seat-1',
        bookingDate: '2026-01-25',
        startTime: '14:00',
        endTime: '18:00',
      };

      const result = await createBooking(dto);

      expect(result).toEqual(mockBooking);
      expect(mockBookingStore.createBooking).toHaveBeenCalledWith(dto);
      expect(mockToastStore.showSuccess).toHaveBeenCalledWith('预约成功');
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

      expect(mockBookingStore.createBooking).not.toHaveBeenCalled();
      expect(mockToastStore.showError).toHaveBeenCalledWith('请先登录');
    });

    it('应该处理预约时间冲突', async () => {
      const error = new Error('该时段已被预约');
      mockBookingStore.createBooking.mockRejectedValue(error);

      const { createBooking } = useBooking({ http: mockHttp });

      await expect(
        createBooking({
          seatId: 'seat-1',
          bookingDate: '2026-01-25',
          startTime: '14:00',
          endTime: '18:00',
        })
      ).rejects.toThrow('该时段已被预约');

      expect(mockToastStore.showError).toHaveBeenCalledWith('预约失败');
    });

    it('应该处理积分不足的情况', async () => {
      mockUserStore.user.points = 10;
      const error = new Error('积分不足');
      mockBookingStore.createBooking.mockRejectedValue(error);

      const { createBooking } = useBooking({ http: mockHttp });

      await expect(
        createBooking({
          seatId: 'seat-1',
          bookingDate: '2026-01-25',
          startTime: '14:00',
          endTime: '18:00',
        })
      ).rejects.toThrow('积分不足');
    });
  });

  describe('cancelBooking', () => {
    it('应该成功取消预约', async () => {
      mockBookingStore.cancelBooking.mockResolvedValue(undefined);

      const { cancelBooking } = useBooking({ http: mockHttp });

      await cancelBooking('booking-123');

      expect(mockBookingStore.cancelBooking).toHaveBeenCalledWith('booking-123');
      expect(mockToastStore.showSuccess).toHaveBeenCalledWith('预约已取消');
    });

    it('应该处理取消失败的预约', async () => {
      const error = new Error('预约已开始，无法取消');
      mockBookingStore.cancelBooking.mockRejectedValue(error);

      const { cancelBooking } = useBooking({ http: mockHttp });

      await expect(cancelBooking('booking-123')).rejects.toThrow(
        '预约已开始，无法取消'
      );
      expect(mockToastStore.showError).toHaveBeenCalledWith('取消失败');
    });

    it('应该处理不存在预约的取消请求', async () => {
      const error = new Error('预约不存在');
      mockBookingStore.cancelBooking.mockRejectedValue(error);

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

      mockBookingStore.checkIn.mockResolvedValue(mockResponse);

      const { checkIn } = useBooking({ http: mockHttp });

      const result = await checkIn('booking-123');

      expect(result).toEqual(mockResponse);
      expect(mockBookingStore.checkIn).toHaveBeenCalledWith('booking-123');
      expect(mockToastStore.showSuccess).toHaveBeenCalledWith('签到成功');
    });

    it('应该处理重复签到', async () => {
      const error = new Error('已经签到过了');
      mockBookingStore.checkIn.mockRejectedValue(error);

      const { checkIn } = useBooking({ http: mockHttp });

      await expect(checkIn('booking-123')).rejects.toThrow('已经签到过了');
      expect(mockToastStore.showError).toHaveBeenCalledWith('签到失败');
    });

    it('应该处理迟到签到', async () => {
      const error = new Error('已超过签到时间');
      mockBookingStore.checkIn.mockRejectedValue(error);

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

      mockBookingStore.checkOut.mockResolvedValue(mockResponse);

      const { checkOut } = useBooking({ http: mockHttp });

      const result = await checkOut('booking-123');

      expect(result).toEqual(mockResponse);
      expect(mockBookingStore.checkOut).toHaveBeenCalledWith('booking-123');
      expect(mockToastStore.showSuccess).toHaveBeenCalledWith('签退成功');
    });

    it('应该处理未签到就签退的情况', async () => {
      const error = new Error('尚未签到');
      mockBookingStore.checkOut.mockRejectedValue(error);

      const { checkOut } = useBooking({ http: mockHttp });

      await expect(checkOut('booking-123')).rejects.toThrow('尚未签到');
      expect(mockToastStore.showError).toHaveBeenCalledWith('签退失败');
    });
  });

  describe('fetchBookings', () => {
    it('应该成功获取预约列表', async () => {
      mockBookingStore.fetchBookings.mockResolvedValue(undefined);

      const { fetchBookings } = useBooking({ http: mockHttp });

      await fetchBookings();

      expect(mockBookingStore.fetchBookings).toHaveBeenCalled();
    });

    it('应该处理空预约列表', async () => {
      mockBookingStore.fetchBookings.mockResolvedValue(undefined);

      const { fetchBookings } = useBooking({ http: mockHttp });

      await fetchBookings();

      expect(mockBookingStore.fetchBookings).toHaveBeenCalled();
    });

    it('应该处理网络错误', async () => {
      const error = new Error('网络错误');
      mockBookingStore.fetchBookings.mockRejectedValue(error);

      const { fetchBookings } = useBooking({ http: mockHttp });

      await expect(fetchBookings()).rejects.toThrow('网络错误');
      expect(mockToastStore.showError).toHaveBeenCalledWith('获取预约列表失败');
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
