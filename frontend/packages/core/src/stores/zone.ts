/**
 * Zone Store - 区域管理
 *
 * 职责：
 * 1. 管理区域列表数据
 * 2. 提供区域数据获取方法
 * 3. 计算区域状态和统计
 */

import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type { HttpAdapter } from '../adapters';
import type { Zone, ZoneStatus, ZonesResponse } from '../types/zone';

export const useZoneStore = defineStore('zone', () => {
  // ========== 状态 ==========
  const zones = ref<Zone[]>([]);
  const loading = ref(false);
  const error = ref<string | null>(null);

  // ========== 计算属性 ==========
  const totalZones = computed(() => zones.value.length);
  const totalCapacity = computed(() => zones.value.reduce((sum, z) => sum + z.capacity, 0));
  const totalAvailableSeats = computed(() => zones.value.reduce((sum, z) => sum + z.availableSeats, 0));

  // 按楼层分组
  const zonesByFloor = computed(() => {
    const grouped: Record<number, Zone[]> = {};
    zones.value.forEach(zone => {
      if (!grouped[zone.floor]) {
        grouped[zone.floor] = [];
      }
      grouped[zone.floor].push(zone);
    });
    return grouped;
  });

  // 获取繁忙区域
  const busyZones = computed(() => {
    return zones.value.filter(z => z.status === 'busy');
  });

  // 获取可用区域
  const availableZones = computed(() => {
    return zones.value.filter(z => z.status === 'available');
  });

  // ========== Actions ==========

  /**
   * 获取所有区域列表
   */
  async function fetchZones(http?: HttpAdapter) {
    if (!http) {
      // 使用 mock 数据
      loadMockZones();
      return;
    }

    loading.value = true;
    error.value = null;

    try {
      const response = await http.get<ZonesResponse>('/booking/zones');
      zones.value = response.zones;
    } catch (err) {
      error.value = err instanceof Error ? err.message : '获取区域列表失败';
      console.error('[ZoneStore] Failed to fetch zones:', err);
      // 失败时使用 mock 数据
      loadMockZones();
    } finally {
      loading.value = false;
    }
  }

  /**
   * 根据 ID 获取区域
   */
  function getZoneById(id: string): Zone | undefined {
    return zones.value.find(z => z.id === id);
  }

  /**
   * 获取区域状态文本
   */
  function getZoneStatusText(status: ZoneStatus): string {
    switch (status) {
      case 'available':
        return '空闲';
      case 'moderate':
        return '适中';
      case 'busy':
        return '繁忙';
      default:
        return '未知';
    }
  }

  /**
   * 获取区域状态颜色类
   */
  function getZoneStatusClass(status: ZoneStatus): string {
    switch (status) {
      case 'available':
        return 'status-available';
      case 'moderate':
        return 'status-moderate';
      case 'busy':
        return 'status-busy';
      default:
        return 'status-available';
    }
  }

  /**
   * 计算区域状态
   */
  function calculateZoneStatus(occupancyRate: number): ZoneStatus {
    if (occupancyRate >= 80) return 'busy';
    if (occupancyRate >= 50) return 'moderate';
    return 'available';
  }

  // ========== Mock 数据 ==========
  function loadMockZones() {
    zones.value = [
      {
        id: 'zone-1f',
        name: '综合阅览区',
        floor: 1,
        description: '开放式阅览空间，配备舒适座椅',
        capacity: 48,
        availableSeats: 9,
        occupancyRate: 81.25,
        status: 'busy',
        hourlyPrice: 10,
        features: ['WiFi', '充电插座', '自然采光'],
        openTime: '08:00',
        closeTime: '22:00',
      },
      {
        id: 'zone-2f',
        name: '静音研讨区',
        floor: 2,
        description: '安静的学习环境，适合深度工作',
        capacity: 36,
        availableSeats: 20,
        occupancyRate: 44.44,
        status: 'moderate',
        hourlyPrice: 15,
        features: ['WiFi', '充电插座', '台灯', '静音'],
        openTime: '08:00',
        closeTime: '22:00',
      },
      {
        id: 'zone-3f',
        name: '协作办公台',
        floor: 3,
        description: '适合小组讨论和协作工作',
        capacity: 24,
        availableSeats: 21,
        occupancyRate: 12.5,
        status: 'available',
        hourlyPrice: 20,
        features: ['WiFi', '充电插座', '白板', '投影仪'],
        openTime: '09:00',
        closeTime: '21:00',
      },
    ];
  }

  return {
    // 状态
    zones,
    loading,
    error,

    // 计算属性
    totalZones,
    totalCapacity,
    totalAvailableSeats,
    zonesByFloor,
    busyZones,
    availableZones,

    // Actions
    fetchZones,
    getZoneById,
    getZoneStatusText,
    getZoneStatusClass,
    calculateZoneStatus,
  };
});
