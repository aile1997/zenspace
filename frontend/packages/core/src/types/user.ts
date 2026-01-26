/**
 * 用户相关类型定义
 */

/** 用户等级 */
export enum UserLevel {
  NORMAL = 'NORMAL',
  VIP = 'VIP',
}

/** 用户信息 */
export interface User {
  id: string;
  phone: string;
  nickname: string;
  avatar: string;
  level: UserLevel;
  points: number;
  creditScore: number;
  isAuthenticated: boolean;
}

/** 登录响应 */
export interface LoginResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
}

/** 验证码登录 DTO */
export interface SmsLoginDTO {
  phone: string;
  code: string;
}

/** 微信登录 DTO */
export interface WechatLoginDTO {
  code: string;
}
