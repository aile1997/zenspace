/**
 * 认证相关业务逻辑
 *
 * 处理用户登录、登出、Token 刷新等功能
 */
import { computed } from 'vue';
import { useUserStore } from '../stores';
import type { SmsLoginDTO, WechatLoginDTO, LoginResponse } from '../types';
import type { IHttp } from '../adapters';

export interface UseAuthOptions {
  http: IHttp;
}

export function useAuth(options: UseAuthOptions) {
  const userStore = useUserStore();
  const { http } = options;

  // ========== 计算属性 ==========
  const isAuthenticated = computed(() => userStore.isAuthenticated);
  const isVIP = computed(() => userStore.isVIP);
  const user = computed(() => userStore.user);

  // ========== Methods ==========

  /**
   * 发送验证码
   */
  const sendSmsCode = async (phone: string) => {
    console.log('[useAuth] sendSmsCode 开始', phone);

    // 验证手机号格式
    const phoneRegex = /^1[3-9]\d{9}$/;
    if (!phoneRegex.test(phone)) {
      console.error('[useAuth] 手机号格式错误', phone);
      throw new Error('手机号格式不正确');
    }

    console.log('[useAuth] 发送验证码请求到 /auth/send-code');
    const result = await http.post('/auth/send-code', { phone });
    console.log('[useAuth] 验证码发送响应', result);
    return result;
  };

  /**
   * 验证码登录
   */
  const smsLogin = async (dto: SmsLoginDTO) => {
    console.log('[useAuth] smsLogin 开始', dto);

    // 验证验证码格式
    if (!/^\d{6}$/.test(dto.code)) {
      console.error('[useAuth] 验证码格式错误', dto.code);
      throw new Error('验证码格式不正确');
    }

    console.log('[useAuth] 发送登录请求到 /auth/login');
    const response = await http.post<LoginResponse>('/auth/login', dto);
    console.log('[useAuth] 登录响应', response);

    await userStore.login(response);
    return response;
  };

  /**
   * 微信登录
   */
  const wechatLogin = async (dto: WechatLoginDTO) => {
    const response = await http.post<LoginResponse>('/auth/wechat-login', dto);
    await userStore.login(response);
    return response;
  };

  /**
   * 登出
   */
  const logout = async () => {
    try {
      await http.post('/auth/logout');
    } finally {
      await userStore.logout();
    }
  };

  /**
   * 刷新 Token
   */
  const refreshToken = async () => {
    const response = await http.post<LoginResponse>('/auth/refresh', {
      refreshToken: userStore.refreshToken,
    });
    await userStore.login(response);
    return response;
  };

  return {
    // 计算属性
    isAuthenticated,
    isVIP,
    user,

    // 方法
    sendSmsCode,
    smsLogin,
    wechatLogin,
    logout,
    refreshToken,
  };
}
