<!-- ZenSpace 首页 - 优化版本 (iOS 18 风格) -->
<template>
  <view class="min-h-screen bg-white flex flex-col pb-8">
    <!-- Header Section -->
    <view class="pt-16 pb-8 px-6 flex justify-between items-end">
      <view class="flex flex-col gap-2">
        <text class="text-[10px] font-bold tracking-[0.3em] text-gray-500 uppercase pl-0.5">ZenSpace</text>
        <view class="relative group cursor-pointer flex items-center gap-2" @tap="handleLocationChange">
          <text class="font-serif text-[32px] font-light text-gray-900 tracking-tight leading-tight">
            丸の内
            <text class="text-2xl opacity-60">中央馆</text>
          </text>
          <text class="material-symbols-outlined text-gray-400 group-hover:text-gray-900 transition-colors text-[24px] self-start mt-2">
            expand_more
          </text>
        </view>
      </view>
      <view
        @tap="goToNotifications"
        class="relative w-12 h-12 rounded-full border border-gray-200 bg-white shadow-sm flex items-center justify-center hover:shadow-md hover:scale-105 transition-all duration-300 active:scale-95 cursor-pointer"
      >
        <text class="material-symbols-outlined text-gray-800 text-[22px]">notifications</text>
        <view class="absolute top-3.5 right-3.5 w-2 h-2 rounded-full bg-red-500 ring-2 ring-white shadow-sm"></view>
      </view>
    </view>

    <!-- Real-time Traffic Section -->
    <view class="px-6 flex flex-col gap-10">
      <!-- Section Header -->
      <view class="flex items-center justify-between px-2">
        <text class="text-[10px] font-bold text-gray-500 tracking-[0.2em] uppercase">Real-time Traffic</text>
        <view class="flex items-center gap-2">
          <view
            @tap="goToMap"
            class="px-2 py-1 rounded-full bg-white border border-gray-200 shadow-sm flex items-center gap-1 cursor-pointer hover:bg-gray-50 transition-colors duration-300"
          >
            <text class="material-symbols-outlined text-gray-800 text-[14px]">map</text>
            <text class="text-[9px] text-gray-800 font-medium tracking-wider uppercase">Heatmap</text>
          </view>
          <view class="flex items-center gap-2 px-2 py-1 rounded-full bg-white border border-gray-200 shadow-sm">
            <view class="relative flex h-2 w-2">
              <view class="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></view>
              <view class="relative inline-flex rounded-full h-2 w-2 bg-green-500"></view>
            </view>
            <text class="text-[9px] text-gray-800 font-bold tracking-wider uppercase">Live</text>
          </view>
        </view>
      </view>

      <!-- Stats Card -->
      <view class="bg-white border border-gray-100 rounded-[32px] p-8 flex flex-col gap-8 shadow-sm">
        <!-- 1F 综合阅览区 -->
        <view class="flex flex-col gap-3 group cursor-pointer" @tap="handleZoneClick('1f')">
          <view class="flex justify-between items-end">
            <text class="text-xs text-gray-600 font-medium tracking-wide group-hover:text-gray-900 transition-colors">1F 综合阅览区</text>
            <text class="font-display text-xl text-gray-900 font-bold leading-none">82<text class="text-[10px] text-gray-400 ml-0.5 font-normal">%</text></text>
          </view>
          <view class="h-2 w-full bg-gray-100 rounded-full overflow-hidden p-[2px]">
            <view class="h-full bg-gradient-to-r from-gray-600 via-gray-800 to-black w-[82%] rounded-full shadow-sm transition-all duration-1000 group-hover:w-[85%]"></view>
          </view>
        </view>

        <!-- 2F 静音研讨室 -->
        <view class="flex flex-col gap-3 group cursor-pointer" @tap="handleZoneClick('2f')">
          <view class="flex justify-between items-end">
            <text class="text-xs text-gray-600 font-medium tracking-wide group-hover:text-gray-900 transition-colors">2F 静音研讨室</text>
            <text class="font-display text-xl text-gray-900 font-bold leading-none">45<text class="text-[10px] text-gray-400 ml-0.5 font-normal">%</text></text>
          </view>
          <view class="h-2 w-full bg-gray-100 rounded-full overflow-hidden p-[2px]">
            <view class="h-full bg-gradient-to-r from-gray-300 to-gray-500 w-[45%] rounded-full transition-all duration-1000 group-hover:w-[48%]"></view>
          </view>
        </view>

        <!-- 3F 开放协作台 -->
        <view class="flex flex-col gap-3 group cursor-pointer" @tap="handleZoneClick('3f')">
          <view class="flex justify-between items-end">
            <text class="text-xs text-gray-600 font-medium tracking-wide group-hover:text-gray-900 transition-colors">3F 开放协作台</text>
            <text class="font-display text-xl text-gray-900 font-bold leading-none">12<text class="text-[10px] text-gray-400 ml-0.5 font-normal">%</text></text>
          </view>
          <view class="h-2 w-full bg-gray-100 rounded-full overflow-hidden p-[2px]">
            <view class="h-full bg-gradient-to-r from-gray-200 to-gray-300 w-[12%] rounded-full transition-all duration-1000 group-hover:w-[15%]"></view>
          </view>
        </view>
      </view>
    </view>

    <!-- Feature Cards Section -->
    <view class="grid grid-cols-2 gap-5 px-6 mt-10">
      <!-- 智能选座 -->
      <view
        class="group relative flex flex-col rounded-[24px] overflow-hidden cursor-pointer shadow-sm hover:shadow-md transition-all duration-500 transform hover:-translate-y-1 bg-white border border-gray-100"
        @tap="goToBooking"
      >
        <view class="relative w-full aspect-[4/5] overflow-hidden bg-gray-100">
          <image
            src="https://images.unsplash.com/photo-1507537297725-24a1c434c67b?q=80&w=800&auto=format&fit=crop"
            mode="aspectFill"
            class="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
          />
          <view class="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-90"></view>
        </view>
        <view class="absolute bottom-0 left-0 w-full p-6 flex flex-col items-start">
          <view class="w-10 h-10 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center mb-4 border border-white/20 shadow-lg">
            <text class="material-symbols-outlined text-white text-[20px]">event_seat</text>
          </view>
          <text class="font-serif text-2xl font-light text-white tracking-wide leading-tight">智能
            <text>选座</text>
          </text>
          <view class="h-[1px] w-8 bg-white/40 mt-4 mb-2"></view>
          <text class="text-[9px] text-white/60 font-medium tracking-widest uppercase">Smart Booking</text>
        </view>
      </view>

      <!-- 积分商城 -->
      <view
        class="group relative flex flex-col rounded-[24px] overflow-hidden cursor-pointer shadow-sm hover:shadow-md transition-all duration-500 transform hover:-translate-y-1 bg-white border border-gray-100"
        @tap="goToRewards"
      >
        <view class="relative w-full aspect-[4/5] overflow-hidden bg-gray-100">
          <image
            src="https://images.unsplash.com/photo-1616031036329-373b53c65c2b?q=80&w=800&auto=format&fit=crop"
            mode="aspectFill"
            class="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
          />
          <view class="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-90"></view>
        </view>
        <view class="absolute bottom-0 left-0 w-full p-6 flex flex-col items-start">
          <view class="w-10 h-10 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center mb-4 border border-white/20 shadow-lg">
            <text class="material-symbols-outlined text-white text-[20px]">local_mall</text>
          </view>
          <text class="font-serif text-2xl font-light text-white tracking-wide leading-tight">积分
            <text>商城</text>
          </text>
          <view class="h-[1px] w-8 bg-white/40 mt-4 mb-2"></view>
          <text class="text-[9px] text-white/60 font-medium tracking-widest uppercase">Rewards Club</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { useUserStore } from '@zenspace/core/stores';

const userStore = useUserStore();

onMounted(async () => {
  // 恢复用户登录状态
  await userStore.restore();
});

// 切换位置
const handleLocationChange = () => {
  uni.showToast({
    title: '位置选择功能开发中',
    icon: 'none'
  });
};

// 跳转到通知页
const goToNotifications = () => {
  uni.navigateTo({ url: '/pages/notifications/index' });
};

// 跳转到空间热力图
const goToMap = () => {
  uni.navigateTo({ url: '/pages/map/index' });
};

// 跳转到选座页
const goToBooking = () => {
  uni.navigateTo({ url: '/pages/seat/index' });
};

// 跳转到积分商城
const goToRewards = () => {
  uni.navigateTo({ url: '/pages/rewards/index' });
};

// 点击区域
const handleZoneClick = (zoneId: string) => {
  uni.navigateTo({ url: `/pages/seat/index?zone=${zoneId}` });
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

// 动画关键帧（UniApp 兼容）
@keyframes ping {
  75%, 100% {
    transform: scale(2);
    opacity: 0;
  }
}

.animate-ping {
  animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;
}

.animate-fade-in {
  animation: fadeIn 0.5s ease-out forwards;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

// Grid layout
.grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20rpx;
}

.grid-cols-2 {
  grid-template-columns: repeat(2, 1fr);
}

// Smooth transitions
view {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}
</style>
