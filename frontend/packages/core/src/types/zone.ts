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
  vipPrice: number;
  tags: string[];
  imageUrl?: string;
  occupancy: number; // 0-100 拥挤度百分比
  availableSeats: number;
}

/** 区域类型 */
export enum ZoneType {
  QUIET = 'quiet', // 静音区
  GENERAL = 'general', // 综合区
  COLLABORATIVE = 'collaborative', // 协作区
  PRIVATE = 'private', // 包间
}
