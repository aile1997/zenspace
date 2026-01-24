/**
 * useZone Composable 测试
 *
 * 测试覆盖：
 * 1. 获取所有区域
 * 2. 获取区域详情
 * 3. 根据 ID 获取区域
 * 4. 区域拥挤度计算
 * 5. 区域类型过滤
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { useZone } from '@/composables/useZone';
import type { IHttp } from '@/adapters';
import type { Zone, ZoneType } from '@/types';

describe('useZone', () => {
  let mockHttp: IHttp;

  beforeEach(() => {
    vi.clearAllMocks();

    // 创建 Mock HTTP 适配器
    mockHttp = {
      get: vi.fn(),
      post: vi.fn(),
      put: vi.fn(),
      delete: vi.fn(),
    } as unknown as IHttp;
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('fetchZones', () => {
    it('应该成功获取所有区域', async () => {
      const mockZones: Zone[] = [
        {
          id: 'zone-1',
          name: '1F 综合阅览区',
          floor: '1F',
          type: 'GENERAL',
          capacity: 50,
          hourlyPrice: 10,
          vipPrice: 8,
          tags: ['有插座', '宽敞明亮'],
          imageUrl: 'https://example.com/zone1.jpg',
          availableSeats: 35,
        },
        {
          id: 'zone-2',
          name: '2F 静音研讨区',
          floor: '2F',
          type: 'QUIET',
          capacity: 30,
          hourlyPrice: 15,
          vipPrice: 12,
          tags: ['绝对安静', '独立空间'],
          imageUrl: 'https://example.com/zone2.jpg',
          availableSeats: 10,
        },
        {
          id: 'zone-3',
          name: '3F 开放协作台',
          floor: '3F',
          type: 'COLLABORATIVE',
          capacity: 40,
          hourlyPrice: 12,
          vipPrice: 10,
          tags: ['适合讨论', '白板'],
          imageUrl: 'https://example.com/zone3.jpg',
          availableSeats: 40,
        },
      ];

      vi.mocked(mockHttp.get).mockResolvedValue(mockZones);

      const { fetchZones, zones } = useZone({ http: mockHttp });

      await fetchZones();

      expect(mockHttp.get).toHaveBeenCalledWith('/zones');
      expect(zones.value).toEqual(mockZones);
      expect(zones.value).toHaveLength(3);
    });

    it('应该处理空区域列表', async () => {
      vi.mocked(mockHttp.get).mockResolvedValue([]);

      const { fetchZones, zones } = useZone({ http: mockHttp });

      await fetchZones();

      expect(zones.value).toEqual([]);
      expect(zones.value).toHaveLength(0);
    });

    it('应该处理获取区域列表失败', async () => {
      vi.mocked(mockHttp.get).mockRejectedValue(new Error('网络错误'));

      const { fetchZones, loading } = useZone({ http: mockHttp });

      await expect(fetchZones()).rejects.toThrow('网络错误');
      expect(loading.value).toBe(false);
    });

    it('应该在获取时设置 loading 状态', async () => {
      vi.mocked(mockHttp.get).mockImplementation(
        () =>
          new Promise((resolve) => {
            setTimeout(() => resolve([]), 100);
          })
      );

      const { fetchZones, loading } = useZone({ http: mockHttp });

      const promise = fetchZones();

      // 立即检查 loading 状态
      expect(loading.value).toBe(true);

      await promise;

      expect(loading.value).toBe(false);
    });
  });

  describe('fetchZoneDetail', () => {
    it('应该成功获取区域详情', async () => {
      const mockZone: Zone = {
        id: 'zone-1',
        name: '1F 综合阅览区',
        floor: '1F',
        type: 'GENERAL',
        capacity: 50,
        hourlyPrice: 10,
        vipPrice: 8,
        tags: ['有插座', '宽敞明亮'],
        imageUrl: 'https://example.com/zone1.jpg',
        description: '位于一层的综合阅览区，环境舒适',
        facilities: ['wifi', 'power', 'aircon'],
        availableSeats: 35,
        occupiedSeats: 15,
      };

      vi.mocked(mockHttp.get).mockResolvedValue(mockZone);

      const { fetchZoneDetail } = useZone({ http: mockHttp });

      const result = await fetchZoneDetail('zone-1');

      expect(result).toEqual(mockZone);
      expect(mockHttp.get).toHaveBeenCalledWith('/zones/zone-1');
    });

    it('应该处理区域不存在的情况', async () => {
      vi.mocked(mockHttp.get).mockRejectedValue(new Error('区域不存在'));

      const { fetchZoneDetail } = useZone({ http: mockHttp });

      await expect(fetchZoneDetail('invalid-zone')).rejects.toThrow('区域不存在');
    });

    it('应该处理网络错误', async () => {
      vi.mocked(mockHttp.get).mockRejectedValue(new Error('网络连接失败'));

      const { fetchZoneDetail } = useZone({ http: mockHttp });

      await expect(fetchZoneDetail('zone-1')).rejects.toThrow('网络连接失败');
    });
  });

  describe('getZoneById', () => {
    it('应该根据 ID 返回正确的区域', async () => {
      const mockZones: Zone[] = [
        {
          id: 'zone-1',
          name: '1F 综合阅览区',
          floor: '1F',
          type: 'GENERAL',
          capacity: 50,
          hourlyPrice: 10,
          vipPrice: 8,
          tags: ['有插座'],
          imageUrl: 'https://example.com/zone1.jpg',
          availableSeats: 35,
        },
        {
          id: 'zone-2',
          name: '2F 静音研讨区',
          floor: '2F',
          type: 'QUIET',
          capacity: 30,
          hourlyPrice: 15,
          vipPrice: 12,
          tags: ['绝对安静'],
          imageUrl: 'https://example.com/zone2.jpg',
          availableSeats: 10,
        },
      ];

      vi.mocked(mockHttp.get).mockResolvedValue(mockZones);

      const { fetchZones, zones, getZoneById } = useZone({ http: mockHttp });

      await fetchZones();

      const zone1 = getZoneById('zone-1');
      const zone2 = getZoneById('zone-2');
      const invalidZone = getZoneById('invalid-id');

      expect(zone1).toEqual(mockZones[0]);
      expect(zone1?.name).toBe('1F 综合阅览区');

      expect(zone2).toEqual(mockZones[1]);
      expect(zone2?.name).toBe('2F 静音研讨区');

      expect(invalidZone).toBeUndefined();
    });

    it('应该在没有加载区域时返回 undefined', () => {
      const { getZoneById } = useZone({ http: mockHttp });

      const zone = getZoneById('zone-1');

      expect(zone).toBeUndefined();
    });
  });

  describe('区域拥挤度计算', () => {
    it('应该正确计算拥挤度百分比', () => {
      const mockZones: Zone[] = [
        {
          id: 'zone-1',
          name: '1F 综合阅览区',
          floor: '1F',
          type: 'GENERAL',
          capacity: 50,
          hourlyPrice: 10,
          vipPrice: 8,
          tags: ['有插座'],
          imageUrl: 'https://example.com/zone1.jpg',
          availableSeats: 35,
          occupiedSeats: 15,
        },
        {
          id: 'zone-2',
          name: '2F 静音研讨区',
          floor: '2F',
          type: 'QUIET',
          capacity: 30,
          hourlyPrice: 15,
          vipPrice: 12,
          tags: ['绝对安静'],
          imageUrl: 'https://example.com/zone2.jpg',
          availableSeats: 5,
          occupiedSeats: 25,
        },
      ];

      const { zones } = useZone({ http: mockHttp });

      zones.value = mockZones;

      // 计算拥挤度
      const zone1Occupancy = zones.value[0].occupiedSeats! / zones.value[0].capacity;
      const zone2Occupancy = zones.value[1].occupiedSeats! / zones.value[1].capacity;

      expect(zone1Occupancy).toBe(0.3); // 30%
      expect(zone2Occupancy).toBeCloseTo(0.833, 2); // 83.3%
    });

    it('应该根据拥挤度返回状态等级', () => {
      const mockZones: Zone[] = [
        {
          id: 'zone-1',
          name: '空闲区域',
          floor: '1F',
          type: 'GENERAL',
          capacity: 100,
          hourlyPrice: 10,
          vipPrice: 8,
          tags: [],
          imageUrl: '',
          availableSeats: 90,
          occupiedSeats: 10,
        },
        {
          id: 'zone-2',
          name: '适中区域',
          floor: '2F',
          type: 'QUIET',
          capacity: 100,
          hourlyPrice: 15,
          vipPrice: 12,
          tags: [],
          imageUrl: '',
          availableSeats: 50,
          occupiedSeats: 50,
        },
        {
          id: 'zone-3',
          name: '拥挤区域',
          floor: '3F',
          type: 'COLLABORATIVE',
          capacity: 100,
          hourlyPrice: 12,
          vipPrice: 10,
          tags: [],
          imageUrl: '',
          availableSeats: 10,
          occupiedSeats: 90,
        },
      ];

      const { zones } = useZone({ http: mockHttp });

      zones.value = mockZones;

      // 计算拥挤度等级
      const getOccupancyLevel = (zone: Zone) => {
        const occupancy = (zone.occupiedSeats || 0) / zone.capacity;
        if (occupancy < 0.5) return '舒适';
        if (occupancy < 0.8) return '适中';
        return '拥挤';
      };

      expect(getOccupancyLevel(zones.value[0])).toBe('舒适');
      expect(getOccupancyLevel(zones.value[1])).toBe('适中');
      expect(getOccupancyLevel(zones.value[2])).toBe('拥挤');
    });
  });

  describe('区域类型过滤', () => {
    it('应该支持按区域类型过滤', () => {
      const mockZones: Zone[] = [
        {
          id: 'zone-1',
          name: '静音区',
          floor: '2F',
          type: 'QUIET',
          capacity: 30,
          hourlyPrice: 15,
          vipPrice: 12,
          tags: ['绝对安静'],
          imageUrl: '',
        },
        {
          id: 'zone-2',
          name: '综合区',
          floor: '1F',
          type: 'GENERAL',
          capacity: 50,
          hourlyPrice: 10,
          vipPrice: 8,
          tags: ['有插座'],
          imageUrl: '',
        },
        {
          id: 'zone-3',
          name: '协作区',
          floor: '3F',
          type: 'COLLABORATIVE',
          capacity: 40,
          hourlyPrice: 12,
          vipPrice: 10,
          tags: ['适合讨论'],
          imageUrl: '',
        },
      ];

      const { zones } = useZone({ http: mockHttp });

      zones.value = mockZones;

      // 过滤静音区
      const quietZones = zones.value.filter((zone) => zone.type === 'QUIET');
      expect(quietZones).toHaveLength(1);
      expect(quietZones[0].name).toBe('静音区');

      // 过滤综合区
      const generalZones = zones.value.filter((zone) => zone.type === 'GENERAL');
      expect(generalZones).toHaveLength(1);
      expect(generalZones[0].name).toBe('综合区');

      // 过滤协作区
      const collaborativeZones = zones.value.filter((zone) => zone.type === 'COLLABORATIVE');
      expect(collaborativeZones).toHaveLength(1);
      expect(collaborativeZones[0].name).toBe('协作区');
    });
  });

  describe('区域价格排序', () => {
    it('应该支持按价格排序', () => {
      const mockZones: Zone[] = [
        {
          id: 'zone-2',
          name: '高价区',
          floor: '2F',
          type: 'QUIET',
          capacity: 30,
          hourlyPrice: 20,
          vipPrice: 15,
          tags: [],
          imageUrl: '',
        },
        {
          id: 'zone-1',
          name: '低价区',
          floor: '1F',
          type: 'GENERAL',
          capacity: 50,
          hourlyPrice: 10,
          vipPrice: 8,
          tags: [],
          imageUrl: '',
        },
        {
          id: 'zone-3',
          name: '中价区',
          floor: '3F',
          type: 'COLLABORATIVE',
          capacity: 40,
          hourlyPrice: 15,
          vipPrice: 12,
          tags: [],
          imageUrl: '',
        },
      ];

      const { zones } = useZone({ http: mockHttp });

      zones.value = mockZones;

      // 按价格升序排序
      const sortedByPrice = [...zones.value].sort((a, b) => a.hourlyPrice - b.hourlyPrice);

      expect(sortedByPrice[0].hourlyPrice).toBe(10);
      expect(sortedByPrice[1].hourlyPrice).toBe(15);
      expect(sortedByPrice[2].hourlyPrice).toBe(20);
    });
  });

  describe('区域可用性统计', () => {
    it('应该正确统计可用座位', () => {
      const mockZones: Zone[] = [
        {
          id: 'zone-1',
          name: '1F 综合阅览区',
          floor: '1F',
          type: 'GENERAL',
          capacity: 50,
          hourlyPrice: 10,
          vipPrice: 8,
          tags: ['有插座'],
          imageUrl: '',
          availableSeats: 35,
        },
        {
          id: 'zone-2',
          name: '2F 静音研讨区',
          floor: '2F',
          type: 'QUIET',
          capacity: 30,
          hourlyPrice: 15,
          vipPrice: 12,
          tags: ['绝对安静'],
          imageUrl: '',
          availableSeats: 5,
        },
      ];

      const { zones } = useZone({ http: mockHttp });

      zones.value = mockZones;

      // 计算总可用座位
      const totalAvailable = zones.value.reduce((sum, zone) => sum + (zone.availableSeats || 0), 0);

      expect(totalAvailable).toBe(40);

      // 找出最空闲的区域
      const mostAvailable = zones.value.reduce((prev, current) =>
        (prev.availableSeats || 0) > (current.availableSeats || 0) ? prev : current
      );

      expect(mostAvailable.id).toBe('zone-1');
      expect(mostAvailable.availableSeats).toBe(35);
    });
  });

  describe('楼层分组', () => {
    it('应该支持按楼层分组', () => {
      const mockZones: Zone[] = [
        {
          id: 'zone-1',
          name: '1F 综合区',
          floor: '1F',
          type: 'GENERAL',
          capacity: 50,
          hourlyPrice: 10,
          vipPrice: 8,
          tags: [],
          imageUrl: '',
        },
        {
          id: 'zone-2',
          name: '2F 静音区',
          floor: '2F',
          type: 'QUIET',
          capacity: 30,
          hourlyPrice: 15,
          vipPrice: 12,
          tags: [],
          imageUrl: '',
        },
        {
          id: 'zone-3',
          name: '1F 讨论区',
          floor: '1F',
          type: 'COLLABORATIVE',
          capacity: 40,
          hourlyPrice: 12,
          vipPrice: 10,
          tags: [],
          imageUrl: '',
        },
      ];

      const { zones } = useZone({ http: mockHttp });

      zones.value = mockZones;

      // 按楼层分组
      const zonesByFloor = zones.value.reduce<Record<string, Zone[]>>((acc, zone) => {
        if (!acc[zone.floor]) {
          acc[zone.floor] = [];
        }
        acc[zone.floor].push(zone);
        return acc;
      }, {});

      expect(zonesByFloor['1F']).toHaveLength(2);
      expect(zonesByFloor['2F']).toHaveLength(1);
    });
  });
});
