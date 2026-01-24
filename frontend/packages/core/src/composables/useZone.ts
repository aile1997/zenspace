/**
 * 区域相关业务逻辑
 *
 * 处理区域查询、拥挤度更新等功能
 */
import { ref } from 'vue';
import type { Zone } from '../types';
import type { IHttp } from '../adapters';

export interface UseZoneOptions {
  http: IHttp;
}

export function useZone(options: UseZoneOptions) {
  const { http } = options;

  // ========== 状态 ==========
  const zones = ref<Zone[]>([]);
  const loading = ref(false);

  // ========== Methods ==========

  /**
   * 获取所有区域
   */
  const fetchZones = async () => {
    loading.value = true;
    try {
      const result = await http.get<Zone[]>('/zones');
      zones.value = result;
    } finally {
      loading.value = false;
    }
  };

  /**
   * 获取区域详情
   * @param zoneId 区域 ID
   */
  const fetchZoneDetail = async (zoneId: string) => {
    const result = await http.get<Zone>(`/zones/${zoneId}`);
    return result;
  };

  /**
   * 根据 ID 获取区域
   * @param zoneId 区域 ID
   */
  const getZoneById = (zoneId: string) => {
    return zones.value.find((z) => z.id === zoneId);
  };

  return {
    // 状态
    zones,
    loading,

    // 方法
    fetchZones,
    fetchZoneDetail,
    getZoneById,
  };
}
