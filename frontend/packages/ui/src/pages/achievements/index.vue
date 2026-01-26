<!-- ZenSpace 勋章墙 -->
<template>
  <view class="flex flex-col h-full bg-gray-50/50 min-h-screen">
    <!-- Header -->
    <view class="pt-14 pb-4 px-6 bg-white/80 backdrop-blur sticky top-0 z-20 flex flex-col gap-6 border-b border-black/5">
      <view class="flex justify-between items-center">
        <view class="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center" @tap="goBack">
          <text class="material-symbols-outlined text-gray-500 text-[18px]">arrow_back</text>
        </view>
        <text class="font-serif text-lg font-medium text-primary tracking-tight">勋章墙</text>
        <view class="w-8 h-8 rounded-full flex items-center justify-center">
          <text class="material-symbols-outlined text-primary text-[20px]">share</text>
        </view>
      </view>

      <!-- Progress -->
      <view class="flex flex-col gap-2 pb-2">
        <view class="flex justify-between items-end">
          <text class="text-[11px] text-secondary tracking-wide uppercase">Collection Progress</text>
          <text class="font-mono text-sm font-medium text-primary">{{ unlockedCount }} / {{ totalCount }}</text>
        </view>
        <view class="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
          <view
            class="h-full bg-primary transition-all duration-1000 ease-out rounded-full"
            :style="{ width: `${progress}%` }"
          ></view>
        </view>
      </view>
    </view>

    <!-- Grid -->
    <view class="p-6 grid grid-cols-3 gap-y-8 gap-x-4 pb-24 overflow-y-auto">
      <view
        v-for="item in achievements"
        :key="item.id"
        class="flex flex-col items-center text-center gap-3"
      >
        <view
          class="relative w-20 h-20 rounded-full flex items-center justify-center border-4 transition-all duration-500"
          :class="item.status === 'unlocked'
            ? 'bg-white border-yellow-50 shadow-elevation-1'
            : 'bg-gray-100 border-gray-200 opacity-60 grayscale'"
        >
          <!-- Shine effect for unlocked -->
          <view
            v-if="item.status === 'unlocked'"
            class="absolute inset-0 rounded-full bg-gradient-to-tr from-yellow-100/20 to-transparent pointer-events-none"
          ></view>

          <text
            class="material-symbols-outlined text-[32px]"
            :class="item.status === 'unlocked' ? 'text-yellow-500 icon-filled' : 'text-gray-400'"
          >
            {{ item.icon }}
          </text>

          <!-- Status Badge -->
          <view
            v-if="item.status === 'unlocked'"
            class="absolute -bottom-1 -right-1 bg-green-500 border-2 border-white w-5 h-5 rounded-full flex items-center justify-center"
          >
            <text class="material-symbols-outlined text-white text-[12px]">check</text>
          </view>
        </view>

        <view class="flex flex-col gap-0.5">
          <text
            class="font-serif text-xs font-bold"
            :class="item.status === 'unlocked' ? 'text-primary' : 'text-gray-400'"
          >
            {{ item.title }}
          </text>
          <text v-if="item.status === 'unlocked'" class="text-[9px] text-secondary/60 font-mono">
            {{ item.dateUnlocked }}
          </text>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed } from 'vue';

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  status: 'unlocked' | 'locked';
  dateUnlocked?: string;
}

const achievements: Achievement[] = [
  {
    id: 'a1',
    title: '初次见面',
    description: '完成第一次自习室预约并签到',
    icon: 'waving_hand',
    status: 'unlocked',
    dateUnlocked: '2023.10.01'
  },
  {
    id: 'a2',
    title: '专注大师',
    description: '单次专注时长超过 4 小时',
    icon: 'hourglass_top',
    status: 'unlocked',
    dateUnlocked: '2023.10.15'
  },
  {
    id: 'a3',
    title: '早起鸟',
    description: '连续 5 天在早上 8 点前签到',
    icon: 'wb_twilight',
    status: 'locked'
  },
  {
    id: 'a4',
    title: '深夜书房',
    description: '在晚上 10 点后完成一次签退',
    icon: 'dark_mode',
    status: 'locked'
  },
  {
    id: 'a5',
    title: '社交达人',
    description: '在协作区累计学习超过 10 小时',
    icon: 'groups',
    status: 'unlocked',
    dateUnlocked: '2023.10.20'
  },
  {
    id: 'a6',
    title: '全勤奖',
    description: '单月累计签到天数达到 20 天',
    icon: 'calendar_month',
    status: 'locked'
  }
];

const unlockedCount = computed(() =>
  achievements.filter(a => a.status === 'unlocked').length
);

const totalCount = achievements.length;

const progress = computed(() =>
  (unlockedCount.value / totalCount) * 100
);

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

// Filled icon variant
.icon-filled {
  font-variation-settings: 'FILL' 1;
}

// Shadow elevation
.shadow-elevation-1 {
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.08);
}

// Grayscale filter for locked items
.grayscale {
  filter: grayscale(100%);
}

// Grid layout
.grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16rpx 32rpx;
}

.grid-cols-3 {
  grid-template-columns: repeat(3, 1fr);
}
</style>
