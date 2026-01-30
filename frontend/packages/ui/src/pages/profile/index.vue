<!-- ZenSpace 个人中心 - 优化版本 (iOS 18 风格) -->
<template>
  <view class="flex flex-col h-full bg-white min-h-screen">
    <!-- Header with Notification -->
    <view class="pt-12 px-6 flex justify-end items-center">
      <view
        class="relative w-10 h-10 rounded-full border border-gray-200 bg-white shadow-sm flex items-center justify-center hover:shadow-md transition-all duration-300 cursor-pointer"
        @tap="goToNotifications"
      >
        <text class="material-symbols-outlined text-gray-800 text-[20px]">notifications_none</text>
        <view class="absolute top-2.5 right-3 w-2 h-2 rounded-full bg-red-500 border border-white shadow-sm"></view>
      </view>
    </view>

    <view class="flex-1 px-6 flex flex-col gap-8 pt-8 pb-24">
      <!-- User Profile Section -->
      <view class="flex flex-col items-center justify-center gap-4">
        <!-- Avatar with Edit Button -->
        <view class="relative group cursor-pointer">
          <view class="w-24 h-24 rounded-full overflow-hidden border border-gray-100 p-1 bg-white shadow-sm">
            <view class="w-full h-full rounded-full bg-gray-50 flex items-center justify-center overflow-hidden">
              <text class="material-symbols-outlined text-[48px] text-gray-300">person</text>
            </view>
          </view>
          <view class="absolute bottom-0 right-0 bg-gray-900 text-white text-[10px] w-6 h-6 flex items-center justify-center rounded-full border-2 border-white shadow-md hover:scale-110 transition-transform duration-300">
            <text class="material-symbols-outlined text-[14px]">edit</text>
          </view>
        </view>

        <!-- User Info -->
        <view class="text-center flex flex-col gap-3 items-center">
          <text class="font-serif text-2xl font-medium text-gray-900 tracking-tight">{{ userStore.user?.nickname || '未登录' }}</text>
          <view class="flex items-center gap-2 px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-full shadow-sm">
            <text class="material-symbols-outlined text-[14px] text-green-700" style="font-variation-settings: 'FILL' 1">spa</text>
            <text class="text-[11px] font-medium tracking-wide text-gray-600">{{ userStore.userLevel || 'Lv.1 劲竹' }}</text>
          </view>
        </view>
      </view>

      <!-- Function Grid - iOS 18 Style -->
      <view class="grid grid-cols-2 gap-4">
        <!-- 我的预约 -->
        <view
          class="group relative flex flex-col items-center justify-center gap-3 p-6 rounded-2xl bg-white border border-gray-100 shadow-sm hover:shadow-md hover:border-gray-200 transition-all duration-300 cursor-pointer aspect-[1.1/1]"
          @tap="goToMyAppointments"
        >
          <view class="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center group-hover:bg-gray-100 transition-colors duration-300">
            <text class="material-symbols-outlined text-gray-800 text-[22px]">calendar_month</text>
          </view>
          <text class="font-medium text-[13px] tracking-wide text-gray-900">我的预约</text>
        </view>

        <!-- 学习周报 -->
        <view
          class="group relative flex flex-col items-center justify-center gap-3 p-6 rounded-2xl bg-white border border-gray-100 shadow-sm hover:shadow-md hover:border-gray-200 transition-all duration-300 cursor-pointer aspect-[1.1/1]"
          @tap="goToStats"
        >
          <view class="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center group-hover:bg-gray-100 transition-colors duration-300">
            <text class="material-symbols-outlined text-gray-800 text-[22px]">auto_graph</text>
          </view>
          <text class="font-medium text-[13px] tracking-wide text-gray-900">学习周报</text>
        </view>

        <!-- 勋章墙 -->
        <view
          class="group relative flex flex-col items-center justify-center gap-3 p-6 rounded-2xl bg-white border border-gray-100 shadow-sm hover:shadow-md hover:border-gray-200 transition-all duration-300 cursor-pointer aspect-[1.1/1]"
          @tap="goToAchievements"
        >
          <view class="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center group-hover:bg-gray-100 transition-colors duration-300">
            <text class="material-symbols-outlined text-gray-800 text-[22px]">workspace_premium</text>
          </view>
          <text class="font-medium text-[13px] tracking-wide text-gray-900">勋章墙</text>
        </view>

        <!-- 偏好设置 -->
        <view
          class="group relative flex flex-col items-center justify-center gap-3 p-6 rounded-2xl bg-white border border-gray-100 shadow-sm hover:shadow-md hover:border-gray-200 transition-all duration-300 cursor-pointer aspect-[1.1/1]"
          @tap="goToSettings"
        >
          <view class="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center group-hover:bg-gray-100 transition-colors duration-300">
            <text class="material-symbols-outlined text-gray-800 text-[22px]">tune</text>
          </view>
          <text class="font-medium text-[13px] tracking-wide text-gray-900">偏好设置</text>
        </view>
      </view>

      <!-- System Settings Section -->
      <view class="flex flex-col gap-3">
        <text class="text-xs font-bold text-gray-500 tracking-[0.1em] uppercase pl-1">系统设置</text>
        <view class="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm">
          <!-- Account & Security -->
          <view class="flex items-center justify-between p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors duration-300">
            <view class="flex items-center gap-3">
              <text class="material-symbols-outlined text-gray-600 text-[20px]">shield</text>
              <text class="text-[13px] font-medium text-gray-900 tracking-wide">账户与安全</text>
            </view>
            <text class="material-symbols-outlined text-gray-300 text-[18px]">chevron_right</text>
          </view>

          <!-- Help & Feedback -->
          <view class="flex items-center justify-between p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors duration-300">
            <view class="flex items-center gap-3">
              <text class="material-symbols-outlined text-gray-600 text-[20px]">help_center</text>
              <text class="text-[13px] font-medium text-gray-900 tracking-wide">帮助与反馈</text>
            </view>
            <text class="material-symbols-outlined text-gray-300 text-[18px]">chevron_right</text>
          </view>

          <!-- About Us -->
          <view class="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50 transition-colors duration-300">
            <view class="flex items-center gap-3">
              <text class="material-symbols-outlined text-gray-600 text-[20px]">info</text>
              <text class="text-[13px] font-medium text-gray-900 tracking-wide">关于我们</text>
            </view>
            <view class="flex items-center gap-2">
              <text class="text-[10px] text-gray-500">v2.4.0</text>
              <text class="material-symbols-outlined text-gray-300 text-[18px]">chevron_right</text>
            </view>
          </view>
        </view>

        <!-- Logout Button -->
        <view
          class="mt-4 w-full py-3 text-[13px] text-red-600 font-medium tracking-wide bg-red-50 rounded-xl transition-all duration-300 border border-red-100 flex items-center justify-center hover:bg-red-100 active:scale-95"
          @tap="handleLogout"
        >
          退出登录
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { useUserStore } from '@zenspace/core/stores';
import { useAuth } from '@zenspace/core/composables';
import { UniHttp } from '../../utils/adapters';

const userStore = useUserStore();
const http = new UniHttp('http://localhost:3000/api/v1');
const { logout } = useAuth({ http });

// 页面导航
const goToNotifications = () => {
  uni.navigateTo({ url: '/pages/notifications/index' });
};

const goToMyAppointments = () => {
  uni.navigateTo({ url: '/pages/my-appointments/index' });
};

const goToStats = () => {
  uni.navigateTo({ url: '/pages/stats/index' });
};

const goToAchievements = () => {
  uni.navigateTo({ url: '/pages/achievements/index' });
};

const goToSettings = () => {
  uni.navigateTo({ url: '/pages/settings/index' });
};

// 登出
const handleLogout = async () => {
  uni.showModal({
    title: '提示',
    content: '确定要退出登录吗？',
    success: async (res) => {
      if (res.confirm) {
        await logout();
        uni.reLaunch({ url: '/pages/login/index' });
      }
    },
  });
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

// Grid layout
.grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16rpx;
}

.grid-cols-2 {
  grid-template-columns: repeat(2, 1fr);
}

// Smooth transitions
view {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}
</style>
