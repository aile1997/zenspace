/**
 * 用户状态管理
 *
 * 基于 React AppContext 的 user 状态转换而来
 */
import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type { User, UserLevel, LoginResponse } from '../types';
import { getAdapters } from '../adapters';

export const useUserStore = defineStore('user', () => {
  // ========== 状态 ==========
  const user = ref<User | null>(null);
  const token = ref<string>('');

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

    // 持久化到存储
    const { storage } = getAdapters();
    await storage.set('user', response.user);
    await storage.set('token', response.token);
  };

  /**
   * 登出
   */
  const logout = async () => {
    user.value = null;
    token.value = '';

    const { storage } = getAdapters();
    await storage.remove('user');
    await storage.remove('token');
  };

  /**
   * 从存储恢复用户信息
   */
  const restore = async () => {
    const { storage } = getAdapters();
    const savedUser = await storage.get<User>('user');
    const savedToken = await storage.get<string>('token');

    if (savedUser && savedToken) {
      user.value = savedUser;
      token.value = savedToken;
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
