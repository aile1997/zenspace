/**
 * 预约相关业务逻辑
 *
 * 处理预约创建、取消、签到签退等功能
 */
import { computed } from 'vue';
import { useBookingStore, useUserStore, useToastStore } from '../stores';
import type { CreateBookingDTO, Booking } from '../types';
import type { IHttp } from '../adapters';

export interface UseBookingOptions {
  http: IHttp;
}

export function useBooking(options: UseBookingOptions) {
  const bookingStore = useBookingStore();
  const userStore = useUserStore();
  const toastStore = useToastStore();
  const { http } = options;

  // ========== 计算属性 ==========
  const bookings = computed(() => bookingStore.bookings);
  const currentBooking = computed(() => bookingStore.currentBooking);

  // ========== Methods ==========

  /**
   * 创建预约
   * @param dto 预约信息
   */
  const createBooking = async (dto: CreateBookingDTO) => {
    // 检查登录状态
    if (!userStore.isAuthenticated) {
      toastStore.showError('请先登录');
      throw new Error('用户未登录');
    }

    try {
      const result = await bookingStore.createBooking(dto);
      toastStore.showSuccess('预约成功');
      return result;
    } catch (error) {
      toastStore.showError('预约失败');
      throw error;
    }
  };

  /**
   * 取消预约
   * @param bookingId 预约 ID
   */
  const cancelBooking = async (bookingId: string) => {
    try {
      await bookingStore.cancelBooking(bookingId);
      toastStore.showSuccess('预约已取消');
    } catch (error) {
      toastStore.showError('取消失败');
      throw error;
    }
  };

  /**
   * 签到
   * @param bookingId 预约 ID
   */
  const checkIn = async (bookingId: string) => {
    try {
      const result = await bookingStore.checkIn(bookingId);
      toastStore.showSuccess('签到成功');
      return result;
    } catch (error) {
      toastStore.showError('签到失败');
      throw error;
    }
  };

  /**
   * 签退
   * @param bookingId 预约 ID
   */
  const checkOut = async (bookingId: string) => {
    try {
      const result = await bookingStore.checkOut(bookingId);
      toastStore.showSuccess('签退成功');
      return result;
    } catch (error) {
      toastStore.showError('签退失败');
      throw error;
    }
  };

  /**
   * 获取预约列表
   */
  const fetchBookings = async () => {
    try {
      await bookingStore.fetchBookings();
    } catch (error) {
      toastStore.showError('获取预约列表失败');
      throw error;
    }
  };

  return {
    // 计算属性
    bookings,
    currentBooking,

    // 方法
    createBooking,
    cancelBooking,
    checkIn,
    checkOut,
    fetchBookings,
  };
}
