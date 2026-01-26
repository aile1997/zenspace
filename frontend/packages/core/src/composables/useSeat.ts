/**
 * 座位相关业务逻辑
 *
 * 处理座位查询、状态更新等功能
 */
import { ref } from 'vue';
import type { Seat } from '../types';
import type { IHttp } from '../adapters';

export interface UseSeatOptions {
  http: IHttp;
}

export function useSeat(options: UseSeatOptions) {
  const { http } = options;

  // ========== 状态 ==========
  const seats = ref<Seat[]>([]);
  const selectedSeatId = ref<string | null>(null);
  const loading = ref(false);

  // ========== Methods ==========

  /**
   * 获取区域座位列表
   * @param zoneId 区域 ID
   */
  const fetchZoneSeats = async (zoneId: string) => {
    loading.value = true;
    try {
      const result = await http.get<Seat[]>(`/seats/zone/${zoneId}`);
      seats.value = result;
    } finally {
      loading.value = false;
    }
  };

  /**
   * 获取座位实时状态
   * @param seatId 座位 ID
   */
  const fetchSeatStatus = async (seatId: string) => {
    const result = await http.get<Seat>(`/seats/${seatId}/status`);

    // 更新列表中的座位
    const index = seats.value.findIndex((s) => s.id === seatId);
    if (index !== -1) {
      seats.value[index] = result;
    }

    return result;
  };

  /**
   * 选择座位
   * @param seatId 座位 ID
   */
  const selectSeat = (seatId: string) => {
    // 如果点击已选座位，取消选择
    if (selectedSeatId.value === seatId) {
      selectedSeatId.value = null;
      return;
    }

    const seat = seats.value.find((s) => s.id === seatId);

    if (!seat) {
      throw new Error('座位不存在');
    }

    if (seat.status !== 'available') {
      throw new Error('座位不可选');
    }

    selectedSeatId.value = seatId;
  };

  /**
   * 取消选择
   */
  const clearSelection = () => {
    selectedSeatId.value = null;
  };

  /**
   * 获取选中的座位
   */
  const getSelectedSeat = () => {
    if (!selectedSeatId.value) return null;
    return seats.value.find((s) => s.id === selectedSeatId.value) ?? null;
  };

  return {
    // 状态
    seats,
    selectedSeatId,
    loading,

    // 方法
    fetchZoneSeats,
    fetchSeatStatus,
    selectSeat,
    clearSelection,
    getSelectedSeat,
  };
}
