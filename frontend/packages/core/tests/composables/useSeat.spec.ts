/**
 * useSeat Composable 测试
 *
 * 测试覆盖：
 * 1. 获取区域座位列表
 * 2. 获取座位实时状态
 * 3. 选择座位
 * 4. 取消选择
 * 5. 获取选中的座位
 * 6. 座位状态变化模拟
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { useSeat } from '@/composables/useSeat';
import type { IHttp } from '@/adapters';
import type { Seat, SeatStatus } from '@/types';

describe('useSeat', () => {
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

  describe('fetchZoneSeats', () => {
    it('应该成功获取区域座位列表', async () => {
      const mockSeats: Seat[] = [
        {
          id: 'seat-1',
          zoneId: 'zone-1',
          label: 'A1',
          type: 'WINDOW',
          status: 'AVAILABLE',
          x: 0,
          y: 0,
        },
        {
          id: 'seat-2',
          zoneId: 'zone-1',
          label: 'A2',
          type: 'STANDARD',
          status: 'OCCUPIED',
          x: 1,
          y: 0,
        },
        {
          id: 'seat-3',
          zoneId: 'zone-1',
          label: 'B1',
          type: 'BOOTH',
          status: 'AVAILABLE',
          x: 0,
          y: 1,
        },
      ];

      vi.mocked(mockHttp.get).mockResolvedValue(mockSeats);

      const { fetchZoneSeats, seats } = useSeat({ http: mockHttp });

      await fetchZoneSeats('zone-1');

      expect(mockHttp.get).toHaveBeenCalledWith('/seats/zone/zone-1');
      expect(seats.value).toEqual(mockSeats);
      expect(seats.value).toHaveLength(3);
    });

    it('应该处理空座位列表', async () => {
      vi.mocked(mockHttp.get).mockResolvedValue([]);

      const { fetchZoneSeats, seats } = useSeat({ http: mockHttp });

      await fetchZoneSeats('zone-empty');

      expect(seats.value).toEqual([]);
      expect(seats.value).toHaveLength(0);
    });

    it('应该处理获取座位列表失败', async () => {
      vi.mocked(mockHttp.get).mockRejectedValue(new Error('网络错误'));

      const { fetchZoneSeats, loading } = useSeat({ http: mockHttp });

      await expect(fetchZoneSeats('zone-1')).rejects.toThrow('网络错误');
      expect(loading.value).toBe(false);
    });

    it('应该在获取时设置 loading 状态', async () => {
      vi.mocked(mockHttp.get).mockImplementation(
        () =>
          new Promise((resolve) => {
            setTimeout(() => resolve([]), 100);
          })
      );

      const { fetchZoneSeats, loading } = useSeat({ http: mockHttp });

      const promise = fetchZoneSeats('zone-1');

      // 立即检查 loading 状态
      expect(loading.value).toBe(true);

      await promise;

      expect(loading.value).toBe(false);
    });
  });

  describe('fetchSeatStatus', () => {
    it('应该成功获取座位实时状态', async () => {
      const mockSeat: Seat = {
        id: 'seat-1',
        zoneId: 'zone-1',
        label: 'A1',
        type: 'WINDOW',
        status: 'AVAILABLE',
        x: 0,
        y: 0,
      };

      vi.mocked(mockHttp.get).mockResolvedValue(mockSeat);

      const { fetchSeatStatus } = useSeat({ http: mockHttp });

      const result = await fetchSeatStatus('seat-1');

      expect(result).toEqual(mockSeat);
      expect(mockHttp.get).toHaveBeenCalledWith('/seats/seat-1/status');
    });

    it('应该处理座位不存在的情况', async () => {
      vi.mocked(mockHttp.get).mockRejectedValue(new Error('座位不存在'));

      const { fetchSeatStatus } = useSeat({ http: mockHttp });

      await expect(fetchSeatStatus('invalid-seat')).rejects.toThrow('座位不存在');
    });

    it('应该处理座位状态更新', async () => {
      const seat1: Seat = {
        id: 'seat-1',
        zoneId: 'zone-1',
        label: 'A1',
        type: 'WINDOW',
        status: 'AVAILABLE',
        x: 0,
        y: 0,
      };

      vi.mocked(mockHttp.get).mockResolvedValue(seat1);

      const { fetchSeatStatus, seats } = useSeat({ http: mockHttp });

      // 初始化座位列表
      seats.value = [seat1];

      // 模拟座位被占用
      const updatedSeat: Seat = { ...seat1, status: 'OCCUPIED' };
      vi.mocked(mockHttp.get).mockResolvedValue(updatedSeat);

      await fetchSeatStatus('seat-1');

      // 验证座位列表已更新
      expect(seats.value[0].status).toBe('OCCUPIED');
    });
  });

  describe('selectSeat', () => {
    it('应该成功选择可用座位', () => {
      const mockSeats: Seat[] = [
        {
          id: 'seat-1',
          zoneId: 'zone-1',
          label: 'A1',
          type: 'WINDOW',
          status: 'AVAILABLE',
          x: 0,
          y: 0,
        },
        {
          id: 'seat-2',
          zoneId: 'zone-1',
          label: 'A2',
          type: 'STANDARD',
          status: 'OCCUPIED',
          x: 1,
          y: 0,
        },
      ];

      const { selectSeat, selectedSeatId, seats } = useSeat({ http: mockHttp });

      seats.value = mockSeats;

      selectSeat('seat-1');

      expect(selectedSeatId.value).toBe('seat-1');
    });

    it('应该拒绝选择已占用的座位', () => {
      const mockSeats: Seat[] = [
        {
          id: 'seat-1',
          zoneId: 'zone-1',
          label: 'A1',
          type: 'WINDOW',
          status: 'OCCUPIED',
          x: 0,
          y: 0,
        },
      ];

      const { selectSeat, selectedSeatId, seats } = useSeat({ http: mockHttp });

      seats.value = mockSeats;

      selectSeat('seat-1');

      expect(selectedSeatId.value).toBeNull();
    });

    it('应该拒绝选择维护中的座位', () => {
      const mockSeats: Seat[] = [
        {
          id: 'seat-1',
          zoneId: 'zone-1',
          label: 'A1',
          type: 'WINDOW',
          status: 'MAINTENANCE',
          x: 0,
          y: 0,
        },
      ];

      const { selectSeat, selectedSeatId, seats } = useSeat({ http: mockHttp });

      seats.value = mockSeats;

      selectSeat('seat-1');

      expect(selectedSeatId.value).toBeNull();
    });

    it('应该切换座位选择', () => {
      const mockSeats: Seat[] = [
        {
          id: 'seat-1',
          zoneId: 'zone-1',
          label: 'A1',
          type: 'WINDOW',
          status: 'AVAILABLE',
          x: 0,
          y: 0,
        },
        {
          id: 'seat-2',
          zoneId: 'zone-1',
          label: 'A2',
          type: 'STANDARD',
          status: 'AVAILABLE',
          x: 1,
          y: 0,
        },
      ];

      const { selectSeat, selectedSeatId, seats } = useSeat({ http: mockHttp });

      seats.value = mockSeats;

      // 选择第一个座位
      selectSeat('seat-1');
      expect(selectedSeatId.value).toBe('seat-1');

      // 切换到第二个座位
      selectSeat('seat-2');
      expect(selectedSeatId.value).toBe('seat-2');
    });

    it('应该取消选择（再次点击已选座位）', () => {
      const mockSeats: Seat[] = [
        {
          id: 'seat-1',
          zoneId: 'zone-1',
          label: 'A1',
          type: 'WINDOW',
          status: 'AVAILABLE',
          x: 0,
          y: 0,
        },
      ];

      const { selectSeat, selectedSeatId, seats } = useSeat({ http: mockHttp });

      seats.value = mockSeats;

      // 选择座位
      selectSeat('seat-1');
      expect(selectedSeatId.value).toBe('seat-1');

      // 再次点击取消选择
      selectSeat('seat-1');
      expect(selectedSeatId.value).toBeNull();
    });
  });

  describe('clearSelection', () => {
    it('应该清除座位选择', () => {
      const { selectSeat, clearSelection, selectedSeatId } = useSeat({
        http: mockHttp,
      });

      // 选择座位
      selectSeat('seat-1');
      expect(selectedSeatId.value).toBe('seat-1');

      // 清除选择
      clearSelection();
      expect(selectedSeatId.value).toBeNull();
    });
  });

  describe('getSelectedSeat', () => {
    it('应该返回选中的座位对象', () => {
      const mockSeats: Seat[] = [
        {
          id: 'seat-1',
          zoneId: 'zone-1',
          label: 'A1',
          type: 'WINDOW',
          status: 'AVAILABLE',
          x: 0,
          y: 0,
        },
      ];

      const { selectSeat, getSelectedSeat, seats } = useSeat({ http: mockHttp });

      seats.value = mockSeats;
      selectSeat('seat-1');

      const selected = getSelectedSeat();

      expect(selected).toEqual(mockSeats[0]);
      expect(selected?.label).toBe('A1');
    });

    it('应该在没有选择时返回 null', () => {
      const { getSelectedSeat } = useSeat({ http: mockHttp });

      const selected = getSelectedSeat();

      expect(selected).toBeNull();
    });
  });

  describe('座位类型过滤', () => {
    it('应该支持按座位类型过滤', () => {
      const mockSeats: Seat[] = [
        {
          id: 'seat-1',
          zoneId: 'zone-1',
          label: 'A1',
          type: 'WINDOW',
          status: 'AVAILABLE',
          x: 0,
          y: 0,
        },
        {
          id: 'seat-2',
          zoneId: 'zone-1',
          label: 'A2',
          type: 'STANDARD',
          status: 'AVAILABLE',
          x: 1,
          y: 0,
        },
        {
          id: 'seat-3',
          zoneId: 'zone-1',
          label: 'B1',
          type: 'BOOTH',
          status: 'AVAILABLE',
          x: 0,
          y: 1,
        },
      ];

      const { seats } = useSeat({ http: mockHttp });

      seats.value = mockSeats;

      // 过滤窗边座位
      const windowSeats = seats.value.filter((seat) => seat.type === 'WINDOW');
      expect(windowSeats).toHaveLength(1);
      expect(windowSeats[0].label).toBe('A1');

      // 过滤标准座位
      const standardSeats = seats.value.filter((seat) => seat.type === 'STANDARD');
      expect(standardSeats).toHaveLength(1);
      expect(standardSeats[0].label).toBe('A2');

      // 过滤卡座
      const boothSeats = seats.value.filter((seat) => seat.type === 'BOOTH');
      expect(boothSeats).toHaveLength(1);
      expect(boothSeats[0].label).toBe('B1');
    });
  });

  describe('座位状态统计', () => {
    it('应该正确统计各状态座位数量', () => {
      const mockSeats: Seat[] = [
        { id: 's1', zoneId: 'z1', label: 'A1', type: 'WINDOW', status: 'AVAILABLE', x: 0, y: 0 },
        { id: 's2', zoneId: 'z1', label: 'A2', type: 'STANDARD', status: 'AVAILABLE', x: 1, y: 0 },
        { id: 's3', zoneId: 'z1', label: 'A3', type: 'WINDOW', status: 'OCCUPIED', x: 2, y: 0 },
        { id: 's4', zoneId: 'z1', label: 'B1', type: 'BOOTH', status: 'OCCUPIED', x: 0, y: 1 },
        { id: 's5', zoneId: 'z1', label: 'B2', type: 'STANDARD', status: 'MAINTENANCE', x: 1, y: 1 },
      ];

      const { seats } = useSeat({ http: mockHttp });

      seats.value = mockSeats;

      const availableCount = seats.value.filter((s) => s.status === 'AVAILABLE').length;
      const occupiedCount = seats.value.filter((s) => s.status === 'OCCUPIED').length;
      const maintenanceCount = seats.value.filter((s) => s.status === 'MAINTENANCE').length;

      expect(availableCount).toBe(2);
      expect(occupiedCount).toBe(2);
      expect(maintenanceCount).toBe(1);
    });
  });

  describe('实时状态更新模拟', () => {
    it('应该模拟座位状态变化（轮询效果）', async () => {
      const initialSeats: Seat[] = [
        { id: 'seat-1', zoneId: 'zone-1', label: 'A1', type: 'WINDOW', status: 'AVAILABLE', x: 0, y: 0 },
        { id: 'seat-2', zoneId: 'zone-1', label: 'A2', type: 'STANDARD', status: 'AVAILABLE', x: 1, y: 0 },
      ];

      // 初始状态
      vi.mocked(mockHttp.get).mockResolvedValue(initialSeats);

      const { fetchZoneSeats, seats } = useSeat({ http: mockHttp });

      await fetchZoneSeats('zone-1');

      expect(seats.value[0].status).toBe('AVAILABLE');

      // 模拟状态变化
      const updatedSeats: Seat[] = [
        { id: 'seat-1', zoneId: 'zone-1', label: 'A1', type: 'WINDOW', status: 'OCCUPIED', x: 0, y: 0 },
        { id: 'seat-2', zoneId: 'zone-1', label: 'A2', type: 'STANDARD', status: 'AVAILABLE', x: 1, y: 0 },
      ];

      vi.mocked(mockHttp.get).mockResolvedValue(updatedSeats);

      await fetchZoneSeats('zone-1');

      expect(seats.value[0].status).toBe('OCCUPIED');
    });
  });
});
