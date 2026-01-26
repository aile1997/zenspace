/**
 * 用户状态管理
 *
 * 基于 React AppContext 的 user 状态转换而来
 */
import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type { User, LoginResponse } from '../types';
import { UserLevel } from '../types';
import { getAdapters } from '../adapters';

export const useUserStore = defineStore('user', () => {
  // ========== 状态 ==========
  const user = ref<User | null>(null);
  const token = ref<string>('');
  const refreshToken = ref<string>('');

  // ========== 计算属性 ==========
  const isAuthenticated = computed(() => !!token.value);
  const isVIP = computed(() => user.value?.level === UserLevel.VIP);
  const userName = computed(() => user.value?.nickname ?? '游客');
  const userLevel = computed(() => user.value?.level === UserLevel.VIP ? 'VIP' : '普通用户');

  // ========== Actions ==========

  /**
   * 登录成功后设置用户信息和 Token
   */
  const login = async (response: LoginResponse) => {
    user.value = response.user;
    token.value = response.token;
    refreshToken.value = response.refreshToken;

    // 持久化到存储
    const { storage } = getAdapters();
    await storage.set('user', response.user);
    await storage.set('token', response.token);
    await storage.set('refreshToken', response.refreshToken);
  };

  /**
   * 登出
   */
  const logout = async () => {
    user.value = null;
    token.value = '';
    refreshToken.value = '';

    const { storage } = getAdapters();
    await storage.remove('user');
    await storage.remove('token');
    await storage.remove('refreshToken');
  };

  /**
   * 从存储恢复用户信息
   */
  const restore = async () => {
    const { storage } = getAdapters();
    const savedUser = await storage.get<User>('user');
    const savedToken = await storage.get<string>('token');
    const savedRefreshToken = await storage.get<string>('refreshToken');

    if (savedUser && savedToken) {
      user.value = savedUser;
      token.value = savedToken;
      refreshToken.value = savedRefreshToken ?? '';
    }
  };

  /**
   * 更新用户信息
   */
  const updateUser = (updates: Partial<User>) => {
    if (user.value) {
      user.value = { ...user.value, ...updates };
    }
  };

  /**
   * 扣除积分
   */
  const deductPoints = (amount: number) => {
    if (user.value) {
      user.value.points = Math.max(0, user.value.points - amount);
    }
  };

  return {
    // 状态
    user,
    token,
    refreshToken,

    // 计算属性
    isAuthenticated,
    isVIP,
    userName,
    userLevel,

    // Actions
    login,
    logout,
    restore,
    updateUser,
    deductPoints,
  };
});
