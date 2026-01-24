/**
 * 预约相关类型定义
 */

/** 预约状态 */
export enum BookingStatus {
  PENDING = 'pending', // 待支付
  CONFIRMED = 'confirmed', // 已确认
  ACTIVE = 'active', // 进行中
  COMPLETED = 'completed', // 已完成
  CANCELLED = 'cancelled', // 已取消
  NO_SHOW = 'no_show', // 爽约
}

/** 预约信息 */
export interface Booking {
  id: string;
  userId: string;
  zoneId: string;
  zoneName: string;
  seatId: string;
  seatLabel: string;
  bookingDate: string; // ISO 格式日期
  startTime: string; // HH:mm 格式
  endTime: string; // HH:mm 格式
  status: BookingStatus;
  checkInAt?: string;
  checkOutAt?: string;
  amount: number;
  qrCode?: string;
  createdAt: string;
}

/** 创建预约 DTO */
export interface CreateBookingDTO {
  seatId: string;
  date: string;
  startTime: string;
  endTime: string;
}

/** 取消预约响应 */
export interface CancelBookingResponse {
  refundAmount: number;
  refundStatus: 'pending' | 'success' | 'failed';
}
