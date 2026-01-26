/**
 * 区域相关类型定义
 */

/** 区域信息 */
export interface Zone {
  id: string;
  name: string;
  floor: string;
  capacity: number;
  hourlyPrice: number;
  tags: string[];
  imageUrl?: string;
  occupancyRate: number; // 0-100 占用率百分比
  availableSeats: number;
  status: 'BUSY' | 'MODERATE' | 'AVAILABLE'; // 区域状态
}

/** 区域类型 */
export enum ZoneType {
  QUIET = 'quiet', // 静音区
  GENERAL = 'general', // 综合区
  COLLABORATIVE = 'collaborative', // 协作区
  PRIVATE = 'private', // 包间
}
