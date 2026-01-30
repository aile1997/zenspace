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
  seat: {
    label: string;
    zone: {
      name: string;
      floor: string;
    };
  };
  bookingDate: string | Date; // ISO 格式日期
  startTime: string; // HH:mm 格式
  endTime: string; // HH:mm 格式
  status: BookingStatus;
  amount: number;
  canCancel?: boolean; // 是否可取消
}

/** 向后兼容的预约信息（扁平结构，用于UI组件） */
export interface LegacyBooking extends Booking {
  userId?: string;
  zoneId?: string;
  zoneName: string;
  seatId?: string;
  seatLabel: string;
  createdAt?: string;
  checkInAt?: string;
  checkOutAt?: string;
  qrCode?: string;
}

/** 创建预约 DTO */
export interface CreateBookingDTO {
  seatId: string;
  bookingDate: string; // YYYY-MM-DD 格式
  startTime: string; // HH:mm 格式
  duration: number; // 时长（小时）
}

/** 取消预约响应 */
export interface CancelBookingResponse {
  refundAmount: number;
  refundStatus: 'pending' | 'success' | 'failed';
}
