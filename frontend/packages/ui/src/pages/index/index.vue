<!-- ZenSpace 首页 -->
<template>
  <view class="min-h-screen bg-ios-gray flex flex-col pb-24">
    <!-- 头部区域 -->
    <view class="pt-16 pb-8 px-20 flex justify-between items-end">
      <view class="flex flex-col gap-2">
        <text class="text-[10px] font-bold tracking-[0.3em] text-accent uppercase pl-0.5">ZenSpace</text>
        <view class="relative group cursor-pointer flex items-center gap-2" @tap="handleLocationChange">
          <text class="font-serif text-[32px] font-light text-primary tracking-tight leading-tight">
            丸の内
            <text class="text-2xl opacity-60">中央馆</text>
          </text>
          <text class="material-symbols-outlined text-gray-300 group-hover:text-primary transition-colors text-[24px] self-start mt-2">
            expand_more
          </text>
        </view>
      </view>
      <view
        @tap="goToNotifications"
        class="relative w-12 h-12 rounded-full border border-white bg-white/40 backdrop-blur-xl shadow-sm flex items-center justify-center hover:bg-white hover:shadow-md hover:scale-105 transition-all duration-300 active:scale-95"
      >
        <text class="material-symbols-outlined text-primary text-[22px]">notifications</text>
        <view class="absolute top-3.5 right-3.5 w-2 h-2 rounded-full bg-red-500 ring-2 ring-white"></view>
      </view>
    </view>

    <!-- 实时流量统计 -->
    <view class="px-20 flex flex-col gap-16 animate-fade-in">
      <!-- Section Header -->
      <view class="flex items-center justify-between">
        <text class="text-13px font-400 color-#86868B tracking-[0.2em] uppercase">Real-time Traffic</text>
        <view class="flex items-center gap-2">
          <view
            @tap="goToMap"
            class="px-2 py-1 rounded-full bg-white/80 border border-gray-100 shadow-sm backdrop-blur flex items-center gap-1 cursor-pointer hover:bg-white transition-colors"
          >
            <text class="material-symbols-outlined text-primary text-[14px]">map</text>
            <text class="text-[9px] text-primary font-medium tracking-wider uppercase">Heatmap</text>
          </view>
          <view class="flex items-center gap-2 px-2 py-1 rounded-full bg-white/80 border border-gray-100 shadow-sm backdrop-blur">
            <view class="relative flex h-2 w-2">
              <view class="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></view>
              <view class="relative inline-flex rounded-full h-2 w-2 bg-green-500"></view>
            </view>
            <text class="text-[9px] text-primary font-bold tracking-wider uppercase">Live</text>
          </view>
        </view>
      </view>

      <!-- Stats Card -->
      <view class="bg-white rd-24 p-20 flex flex-col gap-16 shadow-soft">
        <!-- 加载状态骨架屏 -->
        <template v-if="zoneStore.loading">
          <view v-for="i in 3" :key="i" class="flex flex-col gap-3">
            <view class="flex justify-between items-end">
              <view class="h-4 w-32 bg-gray-200 rounded animate-pulse"></view>
              <view class="h-6 w-12 bg-gray-200 rounded animate-pulse"></view>
            </view>
            <view class="h-2 w-full bg-gray-100 rounded-full overflow-hidden p-[2px]">
              <view class="h-full bg-gray-200 w-1/2 rounded-full animate-pulse"></view>
            </view>
          </view>
        </template>

        <!-- 真实数据 -->
        <template v-else>
          <view
            v-for="zone in formattedZones"
            :key="zone.id"
            class="flex flex-col gap-3 group cursor-pointer"
            @tap="handleZoneClick(zone.id)"
          >
            <view class="flex justify-between items-end">
              <view class="flex items-center gap-2">
                <text class="text-xs text-secondary font-medium tracking-wide group-hover:text-primary transition-colors">
                  {{ zone.floorLabel }}
                </text>
                <view
                  :class="[
                    'px-2 py-0.5 rounded-full text-[10px] font-medium',
                    zone.status === 'BUSY' ? 'bg-red-100 text-red-600' :
                    zone.status === 'MODERATE' ? 'bg-yellow-100 text-yellow-600' :
                    'bg-green-100 text-green-600'
                  ]"
                >
                  <text>{{ getStatusText(zone.status) }}</text>
                </view>
              </view>
              <text class="font-display text-xl text-primary font-bold leading-none">
                {{ Math.round(zone.occupancyRate) }}
                <text class="text-[10px] text-gray-400 ml-0.5 font-normal">%</text>
              </text>
            </view>
            <view class="h-2 w-full bg-gray-100 rounded-full overflow-hidden p-[2px]">
              <view
                :class="['h-full bg-gradient-to-r rounded-full shadow-sm transition-all duration-1000', zone.gradientClass]"
                :style="{ width: zone.occupancyRate + '%' }"
              ></view>
            </view>
            <view class="flex items-center justify-between mt-1">
              <text class="text-[10px] text-gray-400">
                剩余 {{ zone.availableSeats }} / {{ zone.capacity }} 座位
              </text>
              <text class="text-[10px] text-accent font-medium">
                ¥{{ zone.hourlyPrice }}/时
              </text>
            </view>
          </view>
        </template>

        <!-- 空状态 -->
        <view v-if="!zoneStore.loading && formattedZones.length === 0" class="text-center py-8">
          <text class="text-gray-400">暂无可用区域</text>
        </view>
      </view>
    </view>

    <!-- 功能卡片 -->
    <view class="grid grid-cols-2 gap-16 px-20 mt-16">
      <!-- 智能选座 -->
      <view
        class="group relative flex flex-col rd-24 overflow-hidden cursor-pointer shadow-soft hover:shadow-float transition-all duration-500 bg-white"
        @tap="goToBooking"
      >
        <view class="relative w-full aspect-[4/5] overflow-hidden">
          <image
            src="https://images.unsplash.com/photo-1507537297725-24a1c434c67b?q=80&w=800&auto=format&fit=crop"
            mode="aspectFill"
            class="w-full h-full object-cover high-key-img transition-transform duration-1000 group-hover:scale-110"
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
        class="group relative flex flex-col rd-24 overflow-hidden cursor-pointer shadow-soft hover:shadow-float transition-all duration-500 bg-white"
        @tap="goToRewards"
      >
        <view class="relative w-full aspect-[4/5] overflow-hidden">
          <image
            src="https://images.unsplash.com/photo-1616031036329-373b53c65c2b?q=80&w=800&auto=format&fit=crop"
            mode="aspectFill"
            class="w-full h-full object-cover high-key-img transition-transform duration-1000 group-hover:scale-110"
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
import { onMounted, computed } from 'vue';
import { useUserStore, useZoneStore } from '@zenspace/core/stores';

const userStore = useUserStore();
const zoneStore = useZoneStore();

// 计算属性：格式化的区域列表
const formattedZones = computed(() => {
  return zoneStore.zones.map(zone => ({
    ...zone,
    floorLabel: `${zone.floor}F ${zone.name}`,
    gradientClass: getGradientClass(zone.occupancyRate),
  }));
});

// 根据占用率获取渐变样式类名
const getGradientClass = (rate: number) => {
  if (rate >= 80) return 'from-gray-600 via-gray-800 to-black';
  if (rate >= 50) return 'from-gray-300 to-gray-500';
  return 'from-gray-200 to-gray-300';
};

// 获取状态文本
const getStatusText = (status: string) => {
  const statusMap: Record<string, string> = {
    BUSY: '繁忙',
    MODERATE: '适中',
    AVAILABLE: '空闲',
  };
  return statusMap[status] || '未知';
};

onMounted(async () => {
  try {
    // 恢复用户登录状态
    await userStore.restore();

    // 加载区域数据
    await zoneStore.fetchZones();
  } catch (error) {
    console.error('加载数据失败:', error);
    uni.showToast({
      title: '加载失败，请重试',
      icon: 'none',
    });
  }
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

// 高调图片滤镜
.high-key-img {
  filter: contrast(0.95) brightness(1.05) saturate(0.9);
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
</style>
