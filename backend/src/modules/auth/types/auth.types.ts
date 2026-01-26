/**
 * 认证模块类型定义
 *
 * 统一管理认证相关的类型定义
 */

/**
 * JWT Token payload
 */
export interface TokenPayload {
  sub: string; // 用户 ID
  phone: string; // 手机号
}

/**
 * 认证响应
 */
export interface AuthResponse {
  accessToken: string; // 访问令牌
  refreshToken: string; // 刷新令牌
  user: AuthUserInfo;
}

/**
 * 用户信息
 */
export interface AuthUserInfo {
  id: string;
  phone: string; // 登录用户必须有手机号
  nickname: string | null;
  avatar: string | null;
  level: string;
  points: number;
  creditScore: number;
}

/**
 * 当前用户装饰器类型
 */
export interface CurrentUser extends AuthUserInfo {
  id: string;
}
