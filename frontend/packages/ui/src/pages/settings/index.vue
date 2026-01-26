<!-- ZenSpace 偏好设置 -->
<template>
  <view class="flex flex-col h-full bg-gray-50/50 min-h-screen">
    <!-- Header -->
    <view class="pt-14 pb-4 px-6 bg-white/80 backdrop-blur sticky top-0 z-20 border-b border-black/5">
      <view class="flex items-center gap-4">
        <view class="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center" @tap="goBack">
          <text class="material-symbols-outlined text-gray-500 text-[18px]">arrow_back</text>
        </view>
        <text class="font-serif text-lg font-medium text-primary tracking-tight">偏好设置</text>
      </view>
    </view>

    <view class="p-6 flex flex-col gap-8 pb-24">

      <!-- Section: Zen Mode -->
      <view class="flex flex-col gap-3">
        <text class="text-[10px] text-secondary uppercase tracking-widest pl-1">专注体验</text>
        <view class="bg-white rounded-2xl border border-black/5 overflow-hidden shadow-sm">
          <view class="p-4 flex items-center justify-between">
            <view class="flex items-center gap-3">
              <view class="w-8 h-8 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600">
                <text class="material-symbols-outlined text-[18px]">self_improvement</text>
              </view>
              <view class="flex flex-col">
                <text class="text-sm font-medium text-primary">Zen Mode</text>
                <text class="text-[10px] text-secondary">入座后自动屏蔽非必要通知</text>
              </view>
            </view>
            <view
              class="w-11 h-6 rounded-full flex items-center transition-colors duration-300 px-0.5"
              :class="zenMode ? 'bg-primary' : 'bg-gray-200'"
              @tap="toggleZenMode"
            >
              <view class="w-5 h-5 rounded-full bg-white shadow-sm transition-transform duration-300" :class="zenMode ? 'translate-x-5' : 'translate-x-0'"></view>
            </view>
          </view>
        </view>
      </view>

      <!-- Section: General -->
      <view class="flex flex-col gap-3">
        <text class="text-[10px] text-secondary uppercase tracking-widest pl-1">通用</text>
        <view class="bg-white rounded-2xl border border-black/5 overflow-hidden shadow-sm flex flex-col">
          <view class="p-4 flex items-center justify-between border-b border-gray-50">
            <view class="flex items-center gap-3">
              <text class="material-symbols-outlined text-gray-400 text-[20px]">notifications</text>
              <text class="text-sm font-medium text-primary">推送通知</text>
            </view>
            <view
              class="w-11 h-6 rounded-full flex items-center transition-colors duration-300 px-0.5"
              :class="notifications ? 'bg-primary' : 'bg-gray-200'"
              @tap="toggleNotifications"
            >
              <view class="w-5 h-5 rounded-full bg-white shadow-sm transition-transform duration-300" :class="notifications ? 'translate-x-5' : 'translate-x-0'"></view>
            </view>
          </view>
          <view class="p-4 flex items-center justify-between border-b border-gray-50">
            <view class="flex items-center gap-3">
              <text class="material-symbols-outlined text-gray-400 text-[20px]">language</text>
              <text class="text-sm font-medium text-primary">多语言</text>
            </view>
            <view class="flex items-center gap-2">
              <text class="text-xs text-secondary">简体中文</text>
              <text class="material-symbols-outlined text-gray-300 text-[18px]">chevron_right</text>
            </view>
          </view>
          <view class="p-4 flex items-center justify-between">
            <view class="flex items-center gap-3">
              <text class="material-symbols-outlined text-gray-400 text-[20px]">dark_mode</text>
              <text class="text-sm font-medium text-primary">深色模式</text>
            </view>
            <view class="flex items-center gap-2">
              <text class="text-xs text-secondary">跟随系统</text>
              <text class="material-symbols-outlined text-gray-300 text-[18px]">chevron_right</text>
            </view>
          </view>
        </view>
      </view>

      <!-- Section: Privacy & Support -->
      <view class="flex flex-col gap-3">
        <text class="text-[10px] text-secondary uppercase tracking-widest pl-1">支持</text>
        <view class="bg-white rounded-2xl border border-black/5 overflow-hidden shadow-sm flex flex-col">
          <view class="p-4 flex items-center justify-between border-b border-gray-50">
            <view class="flex items-center gap-3">
              <text class="material-symbols-outlined text-gray-400 text-[20px]">description</text>
              <text class="text-sm font-medium text-primary">用户协议</text>
            </view>
            <text class="material-symbols-outlined text-gray-300 text-[18px]">chevron_right</text>
          </view>
          <view class="p-4 flex items-center justify-between border-b border-gray-50">
            <view class="flex items-center gap-3">
              <text class="material-symbols-outlined text-gray-400 text-[20px]">lock</text>
              <text class="text-sm font-medium text-primary">隐私政策</text>
            </view>
            <text class="material-symbols-outlined text-gray-300 text-[18px]">chevron_right</text>
          </view>
          <view class="p-4 flex items-center justify-between">
            <view class="flex items-center gap-3">
              <text class="material-symbols-outlined text-gray-400 text-[20px]">delete_outline</text>
              <text class="text-sm font-medium text-red-500">注销账户</text>
            </view>
            <text class="material-symbols-outlined text-gray-300 text-[18px]">chevron_right</text>
          </view>
        </view>
      </view>

      <view class="text-center mt-4">
        <text class="font-serif text-lg text-primary/20">ZenSpace</text>
        <text class="text-[9px] text-gray-300 mt-1 block">Version 2.4.0 (Build 2039)</text>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue';

const zenMode = ref(false);
const notifications = ref(true);

const toggleZenMode = () => {
  zenMode.value = !zenMode.value;
};

const toggleNotifications = () => {
  notifications.value = !notifications.value;
};

const goBack = () => {
  uni.navigateBack();
};
</script>

<style lang="scss" scoped>
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
</style>
