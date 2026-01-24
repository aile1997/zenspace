<!-- ZenSpace 根组件 -->
<template>
  <view class="app">
    <!-- 全局 Toast -->
    <view v-if="toastStore.toast" class="global-toast" :class="`toast-${toastStore.toast.type}`">
      <view class="toast-content">
        <text class="toast-icon">{{ toastIcon }}</text>
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
  switch (toastStore.toast?.type) {
    case 'success':
      return '✓';
    case 'error':
      return '✕';
    default:
      return 'ℹ';
  }
});
</script>

<style lang="scss" scoped>
.app {
  width: 100%;
  height: 100%;
}

.global-toast {
  position: fixed;
  top: 100rpx;
  left: 50%;
  transform: translateX(-50%);
  z-index: 9999;
  animation: toast-fade-in 0.3s ease;
}

@keyframes toast-fade-in {
  from {
    opacity: 0;
    transform: translateX(-50%) translateY(-20rpx);
  }
  to {
    opacity: 1;
    transform: translateX(-50%) translateY(0);
  }
}

.toast-content {
  display: flex;
  align-items: center;
  gap: 16rpx;
  padding: 20rpx 32rpx;
  border-radius: 100rpx;
  box-shadow: 0 8rpx 32rpx rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(20rpx);
}

.toast-success .toast-content {
  background: rgba(34, 197, 94, 0.9);
  color: white;
}

.toast-error .toast-content {
  background: rgba(239, 68, 68, 0.9);
  color: white;
}

.toast-info .toast-content {
  background: rgba(79, 70, 229, 0.9);
  color: white;
}

.toast-icon {
  font-size: 32rpx;
  font-weight: bold;
}

.toast-message {
  font-size: 28rpx;
  font-weight: 500;
}
</style>
