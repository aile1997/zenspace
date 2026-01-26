/**
 * 区域状态管理
 */
import { defineStore } from 'pinia';
import { ref } from 'vue';
import type { Zone, Seat } from '../types';
import { getAdapters } from '../adapters';

export const useZoneStore = defineStore('zone', () => {
  // ========== 状态 ==========
  const zones = ref<Zone[]>([]);
  const currentZone = ref<Zone | null>(null);
  const seats = ref<Seat[]>([]);
  const loading = ref(false);

  // ========== Actions ==========

  /**
   * 获取所有区域（含实时占用率）
   */
  const fetchZones = async () => {
    const { http } = getAdapters();
    loading.value = true;
    try {
      const result = await http.get<{ zones: Zone[] }>('/bookings/zones');
      zones.value = result.zones;
      return result.zones;
    } finally {
      loading.value = false;
    }
  };

  /**
   * 获取区域内的座位列表
   */
  const fetchZoneSeats = async (zoneId: string, date?: string) => {
    const { http } = getAdapters();
    loading.value = true;
    try {
      const dateParam = date || new Date().toISOString().split('T')[0];
      const result = await http.get<{ zone: Zone; seats: Seat[] }>(
        `/bookings/zones/${zoneId}/seats?date=${dateParam}`
      );
      currentZone.value = result.zone;
      seats.value = result.seats;
      return result;
    } finally {
      loading.value = false;
    }
  };

  /**
   * 清空状态
   */
  const clear = () => {
    zones.value = [];
    currentZone.value = null;
    seats.value = [];
  };

  return {
    // 状态
    zones,
    currentZone,
    seats,
    loading,

    // Actions
    fetchZones,
    fetchZoneSeats,
    clear,
  };
});
