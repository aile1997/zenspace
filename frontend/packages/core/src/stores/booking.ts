/**
 * 预约状态管理
 *
 * 基于 React AppContext 的 appointments 状态转换而来
 */
import { defineStore } from 'pinia';
import { ref } from 'vue';
import type { Booking, LegacyBooking, BookingStatus, CreateBookingDTO } from '../types';
import { getAdapters } from '../adapters';

export const useBookingStore = defineStore('booking', () => {
  // ========== 状态 ==========
  const bookings = ref<Booking[]>([]);
  const currentBooking = ref<Booking | null>(null);

  // ========== 辅助函数 ==========

  /**
   * 将 Booking 转换为 LegacyBooking（向后兼容）
   */
  const adaptBookingToLegacy = (booking: Booking): LegacyBooking => {
    return {
      ...booking,
      zoneName: booking.seat.zone.name,
      seatLabel: booking.seat.label,
    };
  };

  // ========== Actions ==========

  /**
   * 创建预约
   */
  const createBooking = async (dto: CreateBookingDTO) => {
    const { http } = getAdapters();
    const result = await http.post<{ booking: Booking }>('/bookings', dto);

    bookings.value.unshift(result.booking);
    currentBooking.value = result.booking;

    return result.booking;
  };

  /**
   * 取消预约
   */
  const cancelBooking = async (bookingId: string) => {
    const { http } = getAdapters();
    await http.delete(`/bookings/${bookingId}`);

    const index = bookings.value.findIndex((b) => b.id === bookingId);
    if (index !== -1) {
      bookings.value[index] = {
        ...bookings.value[index],
        status: BookingStatus.CANCELLED,
      };
    }
  };

  /**
   * 签到（暂未实现）
   */
  const checkIn = async (bookingId: string) => {
    // TODO: 实现签到逻辑
    console.warn('checkIn not implemented yet');
  };

  /**
   * 签退（暂未实现）
   */
  const checkOut = async (bookingId: string) => {
    // TODO: 实现签退逻辑
    console.warn('checkOut not implemented yet');
  };

  /**
   * 获取用户预约列表
   */
  const fetchBookings = async (status?: BookingStatus, page = 1, limit = 20) => {
    const { http } = getAdapters();
    const params = new URLSearchParams();
    if (status) params.append('status', status);
    params.append('page', page.toString());
    params.append('limit', limit.toString());

    const result = await http.get<{
      bookings: Booking[];
      pagination: {
        total: number;
        page: number;
        limit: number;
        totalPages: number;
      };
    }>(`/bookings/my?${params.toString()}`);

    bookings.value = result.bookings;
    return result;
  };

  /**
   * 清空预约列表
   */
  const clearBookings = () => {
    bookings.value = [];
    currentBooking.value = null;
  };

  return {
    // 状态
    bookings,
    currentBooking,

    // Actions
    createBooking,
    cancelBooking,
    checkIn,
    checkOut,
    fetchBookings,
    clearBookings,

    // 辅助函数
    adaptBookingToLegacy,
  };
});
