/**
 * API 路径常量
 */

export const API_PATHS = {
  // 认证
  AUTH_SEND_CODE: '/auth/send-code',
  AUTH_SMS_LOGIN: '/auth/sms-login',
  AUTH_WECHAT_LOGIN: '/auth/wechat-login',
  AUTH_LOGOUT: '/auth/logout',
  AUTH_REFRESH: '/auth/refresh',

  // 区域
  ZONES: '/zones',
  ZONE_DETAIL: (id: string) => `/zones/${id}`,

  // 座位
  SEATS_BY_ZONE: (zoneId: string) => `/seats/zone/${zoneId}`,
  SEAT_STATUS: (seatId: string) => `/seats/${seatId}/status`,

  // 预约
  BOOKINGS: '/bookings',
  BOOKING_DETAIL: (id: string) => `/bookings/${id}`,
  BOOKING_CHECK_IN: (id: string) => `/bookings/${id}/check-in`,
  BOOKING_CHECK_OUT: (id: string) => `/bookings/${id}/check-out`,

  // 用户
  USER_ME: '/users/me',
  USER_APPOINTMENTS: '/users/me/appointments',
} as const;
