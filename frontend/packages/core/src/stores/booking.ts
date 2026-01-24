/**
 * 预约状态管理
 *
 * 基于 React AppContext 的 appointments 状态转换而来
 */
import { defineStore } from 'pinia';
import { ref } from 'vue';
import type { Booking, BookingStatus, CreateBookingDTO } from '../types';
import { getAdapters } from '../adapters';

export const useBookingStore = defineStore('booking', () => {
  // ========== 状态 ==========
  const bookings = ref<Booking[]>([]);
  const currentBooking = ref<Booking | null>(null);

  // ========== Actions ==========

  /**
   * 创建预约
   */
  const createBooking = async (dto: CreateBookingDTO) => {
    const { http } = getAdapters();
    const result = await http.post<Booking>('/bookings', dto);

    bookings.value.unshift(result);
    currentBooking.value = result;

    return result;
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
        status: 'cancelled' as BookingStatus,
      };
    }
  };

  /**
   * 签到
   */
  const checkIn = async (bookingId: string) => {
    const { http } = getAdapters();
    const result = await http.post<Booking>(`/bookings/${bookingId}/check-in`);

    const index = bookings.value.findIndex((b) => b.id === bookingId);
    if (index !== -1) {
      bookings.value[index] = result;
    }

    return result;
  };

  /**
   * 签退
   */
  const checkOut = async (bookingId: string) => {
    const { http } = getAdapters();
    const result = await http.post<Booking>(`/bookings/${bookingId}/check-out`);

    const index = bookings.value.findIndex((b) => b.id === bookingId);
    if (index !== -1) {
      bookings.value[index] = result;
    }

    return result;
  };

  /**
   * 获取用户预约列表
   */
  const fetchBookings = async () => {
    const { http } = getAdapters();
    const result = await http.get<Booking[]>('/bookings');
    bookings.value = result;
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
  };
});
