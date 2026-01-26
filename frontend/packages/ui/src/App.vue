<!-- ZenSpace 根组件 -->
<template>
  <view class="app">
    <!-- 全局 Toast - 匹配 React 版本设计 -->
    <view
      v-if="toastStore.toast"
      class="global-toast"
      :class="`toast-${toastStore.toast.type}`"
    >
      <view class="toast-content glass-effect">
        <text class="material-symbols-outlined toast-icon">{{ toastIcon }}</text>
        <text class="toast-message">{{ toastStore.toast.message }}</text>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useToastStore } from '@zenspace/core/stores';

const toastStore = useToastStore();

const toastIcon = computed(() => {
  if (!toastStore.toast) return 'info';

  switch (toastStore.toast.type) {
    case 'success':
      return 'check_circle';
    case 'error':
      return 'error';
    case 'warning':
      return 'warning';
    case 'info':
    default:
      return 'info';
  }
});
</script>

<style lang="scss" scoped>
.app {
  width: 100%;
  height: 100%;
}

// Material Icons 样式
.material-symbols-outlined {
  font-family: 'Material Symbols Outlined';
  font-weight: normal;
  font-style: normal;
  font-size: 24rpx;
  line-height: 1;
  letter-spacing: normal;
  text-transform: none;
  display: inline-block;
  white-space: nowrap;
  word-wrap: normal;
  direction: ltr;
}

.global-toast {
  position: fixed;
  top: 120rpx;
  left: 50%;
  transform: translateX(-50%);
  z-index: 9999;
  animation: toast-slide-down 0.4s cubic-bezier(0.16, 1, 0.3, 1);
}

@keyframes toast-slide-down {
  from {
    opacity: 0;
    transform: translateX(-50%) translateY(-40rpx);
  }
  to {
    opacity: 1;
    transform: translateX(-50%) translateY(0);
  }
}

.toast-content {
  display: flex;
  align-items: center;
  gap: 12rpx;
  padding: 24rpx 32rpx;
  border-radius: 100rpx;
  box-shadow: 0 8rpx 32rpx rgba(0, 0, 0, 0.12);
  min-width: 200rpx;
  max-width: 560rpx;
}

// Glassmorphism 效果
.glass-effect {
  backdrop-filter: blur(20rpx);
  -webkit-backdrop-filter: blur(20rpx);
}

// Success 样式 - 绿色渐变
.toast-success .toast-content {
  background: linear-gradient(135deg, rgba(34, 197, 94, 0.95), rgba(22, 163, 74, 0.95));
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.2);
}

// Error 样式 - 红色渐变
.toast-error .toast-content {
  background: linear-gradient(135deg, rgba(239, 68, 68, 0.95), rgba(220, 38, 38, 0.95));
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.2);
}

// Info 样式 - 深灰色渐变
.toast-info .toast-content {
  background: linear-gradient(135deg, rgba(26, 26, 26, 0.95), rgba(74, 74, 74, 0.95));
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.15);
}

// Warning 样式 - 橙色渐变
.toast-warning .toast-content {
  background: linear-gradient(135deg, rgba(249, 115, 22, 0.95), rgba(234, 88, 12, 0.95));
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.toast-icon {
  font-size: 36rpx;
  flex-shrink: 0;
}

.toast-message {
  font-size: 28rpx;
  font-weight: 500;
  line-height: 1.4;
}
</style>
