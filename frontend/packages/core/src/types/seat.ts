/**
 * 座位相关类型定义
 */

/** 座位类型 */
export enum SeatType {
  WINDOW = 'window', // 窗边
  STANDARD = 'standard', // 标准
  BOOTH = 'booth', // 卡座
}

/** 座位状态 */
export enum SeatStatus {
  AVAILABLE = 'available', // 可选
  OCCUPIED = 'occupied', // 已占用
  MAINTENANCE = 'maintenance', // 维护中
  LOCKED = 'locked', // 锁定
}

/** 座位信息 */
export interface Seat {
  id: string;
  label: string; // 例如 "A1"
  type: SeatType;
  status: SeatStatus;
  x: number; // 网格列索引
  y: number; // 网格行索引
  bookings?: Array<{
    startTime: string;
    endTime: string;
  }>; // 当天的预约信息
}
