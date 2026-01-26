/**
 * 区域相关类型定义
 */

/** 区域状态 */
export enum ZoneStatus {
  AVAILABLE = 'available',      // 空闲
  MODERATE = 'moderate',        // 适中
  BUSY = 'busy',                // 繁忙
}

/** 区域信息 */
export interface Zone {
  id: string;
  name: string;
  floor: number;
  description?: string;
  capacity: number;
  availableSeats: number;
  occupancyRate: number;        // 占用率百分比 0-100
  status: ZoneStatus;
  hourlyPrice: number;
  features: string[];           // 设施特色
  openTime: string;             // "08:00"
  closeTime: string;            // "22:00"
  imageUrl?: string;
}

/** 区域类型 */
export enum ZoneType {
  QUIET = 'quiet',              // 静音区
  GENERAL = 'general',          // 综合区
  COLLABORATIVE = 'collaborative', // 协作区
  PRIVATE = 'private',          // 包间
}

/** API 响应 - 区域列表 */
export interface ZonesResponse {
  zones: Zone[];
}

/** API 响应 - 座位列表 */
export interface ZoneSeatsResponse {
  zone: {
    id: string;
    name: string;
  };
  seats: Seat[];
}

/** 座位信息（扩展） */
export interface Seat {
  id: string;
  row: string;
  column: number;
  number: string;
  status: 'available' | 'occupied' | 'reserved';
  type: 'STANDARD' | 'WINDOW' | 'VIP';
  features: string[];
  currentBooking: CurrentBooking | null;
}

/** 当前预订信息 */
export interface CurrentBooking {
  endTime: string;             // ISO 8601 格式
}
