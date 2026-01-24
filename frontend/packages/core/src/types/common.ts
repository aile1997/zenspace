/**
 * 通用类型定义
 */

/** API 响应包装 */
export interface ApiResponse<T = unknown> {
  code: number;
  message: string;
  data: T;
  timestamp: number;
}

/** 分页参数 */
export interface PageParams {
  page: number;
  pageSize: number;
}

/** 分页响应 */
export interface PageResponse<T> {
  list: T[];
  total: number;
  page: number;
  pageSize: number;
}

/** Toast 类型 */
export type ToastType = 'success' | 'error' | 'info';

/** Toast 消息 */
export interface ToastMessage {
  message: string;
  type: ToastType;
}
