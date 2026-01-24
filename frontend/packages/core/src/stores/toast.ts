/**
 * Toast 消息状态管理
 *
 * 基于 React AppContext 的 toast 状态转换而来
 */
import { defineStore } from 'pinia';
import { ref } from 'vue';
import type { ToastMessage, ToastType } from '../types';

export const useToastStore = defineStore('toast', () => {
  // ========== 状态 ==========
  const toast = ref<ToastMessage | null>(null);
  let timer: ReturnType<typeof setTimeout> | null = null;

  // ========== Actions ==========

  /**
   * 显示 Toast 消息
   * @param message 消息内容
   * @param type 消息类型
   * @param duration 持续时间（毫秒），默认 3000
   */
  const showToast = (
    message: string,
    type: ToastType = 'info',
    duration: number = 3000
  ) => {
    toast.value = { message, type };

    // 清除之前的定时器
    if (timer) {
      clearTimeout(timer);
    }

    // 自动隐藏
    timer = setTimeout(() => {
      hideToast();
    }, duration);
  };

  /**
   * 隐藏 Toast 消息
   */
  const hideToast = () => {
    toast.value = null;
    if (timer) {
      clearTimeout(timer);
      timer = null;
    }
  };

  /**
   * 显示成功消息
   */
  const showSuccess = (message: string) => {
    showToast(message, 'success');
  };

  /**
   * 显示错误消息
   */
  const showError = (message: string) => {
    showToast(message, 'error');
  };

  /**
   * 显示信息消息
   */
  const showInfo = (message: string) => {
    showToast(message, 'info');
  };

  return {
    // 状态
    toast,

    // Actions
    showToast,
    hideToast,
    showSuccess,
    showError,
    showInfo,
  };
});
