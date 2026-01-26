<!-- ZenSpace 个人中心 -->
<template>
  <view class="flex flex-col h-full bg-gray-50 min-h-screen">
    <!-- Header -->
    <view class="pt-12 px-6 flex justify-end items-center">
      <view
        class="relative w-10 h-10 rounded-full border border-black/5 bg-white/50 backdrop-blur flex items-center justify-center"
        @tap="goToNotifications"
      >
        <text class="material-symbols-outlined text-primary">notifications_none</text>
        <view class="absolute top-2.5 right-3 w-2 h-2 rounded-full bg-red-500 border border-white"></view>
      </view>
    </view>

    <view class="flex-1 px-6 flex flex-col gap-10 pt-4">
      <!-- User Info -->
      <view class="flex flex-col items-center justify-center gap-4">
        <view class="relative group cursor-pointer">
          <view class="w-24 h-24 rounded-full overflow-hidden border-[0.5px] border-black/10 p-1 bg-white shadow-elevation-1">
            <view class="w-full h-full rounded-full bg-gray-50 flex items-center justify-center overflow-hidden">
              <text class="material-symbols-outlined text-[48px] text-gray-300 icon-light">{{ userStore.user?.avatar || 'person' }}</text>
            </view>
          </view>
          <view class="absolute bottom-0 right-0 bg-primary text-white text-[10px] w-6 h-6 flex items-center justify-center rounded-full border-2 border-white">
            <text class="material-symbols-outlined text-[14px]">edit</text>
          </view>
        </view>
        <view class="text-center flex flex-col gap-2 items-center">
          <text class="font-serif text-2xl font-medium text-primary tracking-tight">{{ userStore.user?.nickname || '未登录' }}</text>
          <view class="flex items-center gap-1.5 px-3 py-1 bg-white/60 backdrop-blur border border-black/5 rounded-full shadow-sm">
            <text class="material-symbols-outlined text-[14px] text-green-700 icon-filled">spa</text>
            <text class="text-[11px] font-serif tracking-widest text-secondary font-medium">{{ userStore.userLevel || 'Lv.1' }}</text>
          </view>
        </view>
      </view>

      <!-- Function Grid -->
      <view class="grid grid-cols-2 gap-4">
        <view
          class="group relative flex flex-col items-center justify-center gap-3 p-6 rounded-2xl bg-white/80 border border-black/5 shadow-sm hover:shadow-elevation-1 transition-all duration-300 cursor-pointer aspect-[1.1/1]"
          @tap="goToMyAppointments"
        >
          <view class="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center">
            <text class="material-symbols-outlined icon-light text-[22px]">calendar_month</text>
          </view>
          <text class="font-serif text-[13px] tracking-widest text-primary font-medium">我的预约</text>
        </view>

        <view
          class="group relative flex flex-col items-center justify-center gap-3 p-6 rounded-2xl bg-white/80 border border-black/5 shadow-sm hover:shadow-elevation-1 transition-all duration-300 cursor-pointer aspect-[1.1/1]"
          @tap="goToStats"
        >
          <view class="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center">
            <text class="material-symbols-outlined icon-light text-[22px]">auto_graph</text>
          </view>
          <text class="font-serif text-[13px] tracking-widest text-primary font-medium">学习周报</text>
        </view>

        <view
          class="group relative flex flex-col items-center justify-center gap-3 p-6 rounded-2xl bg-white/80 border border-black/5 shadow-sm hover:shadow-elevation-1 transition-all duration-300 cursor-pointer aspect-[1.1/1]"
          @tap="goToAchievements"
        >
          <view class="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center">
            <text class="material-symbols-outlined icon-light text-[22px]">workspace_premium</text>
          </view>
          <text class="font-serif text-[13px] tracking-widest text-primary font-medium">勋章墙</text>
        </view>

        <view
          class="group relative flex flex-col items-center justify-center gap-3 p-6 rounded-2xl bg-white/80 border border-black/5 shadow-sm hover:shadow-elevation-1 transition-all duration-300 cursor-pointer aspect-[1.1/1]"
          @tap="goToSettings"
        >
          <view class="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center">
            <text class="material-symbols-outlined icon-light text-[22px]">tune</text>
          </view>
          <text class="font-serif text-[13px] tracking-widest text-primary font-medium">偏好设置</text>
        </view>
      </view>

      <!-- System Menu -->
      <view class="flex flex-col">
        <text class="text-xs font-medium text-accent tracking-[0.1em] uppercase mb-3 pl-1">系统设置</text>
        <view class="bg-white/60 backdrop-blur border border-black/5 rounded-2xl overflow-hidden shadow-glass">
          <view class="flex items-center justify-between p-4 border-b border-black/5 cursor-pointer hover:bg-white/80 transition-colors">
            <view class="flex items-center gap-3">
              <text class="material-symbols-outlined text-secondary text-[20px]">shield</text>
              <text class="text-[13px] font-medium text-primary tracking-wide">账户与安全</text>
            </view>
            <text class="material-symbols-outlined text-gray-300 text-[18px]">chevron_right</text>
          </view>
          <view class="flex items-center justify-between p-4 border-b border-black/5 cursor-pointer hover:bg-white/80 transition-colors">
            <view class="flex items-center gap-3">
              <text class="material-symbols-outlined text-secondary text-[20px]">help_center</text>
              <text class="text-[13px] font-medium text-primary tracking-wide">帮助与反馈</text>
            </view>
            <text class="material-symbols-outlined text-gray-300 text-[18px]">chevron_right</text>
          </view>
          <view class="flex items-center justify-between p-4 cursor-pointer hover:bg-white/80 transition-colors">
            <view class="flex items-center gap-3">
              <text class="material-symbols-outlined text-secondary text-[20px]">info</text>
              <text class="text-[13px] font-medium text-primary tracking-wide">关于我们</text>
            </view>
            <view class="flex items-center gap-2">
              <text class="text-[10px] text-accent">v2.4.0</text>
              <text class="material-symbols-outlined text-gray-300 text-[18px]">chevron_right</text>
            </view>
          </view>
        </view>
        <view
          class="mt-6 w-full py-3 text-[13px] text-red-800/70 font-medium tracking-wide bg-red-50/50 rounded-xl transition-colors border border-red-100/50 flex items-center justify-center"
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

// Filled icon variant
.icon-filled {
  font-variation-settings: 'FILL' 1;
}

// Light icon variant
.icon-light {
  font-variation-settings: 'wght' 100, 'GRAD' -25, 'opsz' 24;
}

// Shadow elevation
.shadow-elevation-1 {
  box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.08);
}

// Glass shadow
.shadow-glass {
  box-shadow: 0 8rpx 32rpx rgba(0, 0, 0, 0.06);
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
</style>
