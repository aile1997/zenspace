<!-- ZenSpace 学习周报 -->
<template>
  <view class="flex flex-col h-full bg-gray-50 min-h-screen">
    <!-- Header -->
    <view class="pt-14 pb-4 px-6 bg-white/80 backdrop-blur sticky top-0 z-20 flex justify-between items-center border-b border-black/5">
      <view class="w-8 h-8 rounded-full bg-white border border-gray-200 flex items-center justify-center" @tap="goBack">
        <text class="material-symbols-outlined text-gray-500 text-[18px]">arrow_back</text>
      </view>
      <text class="font-serif text-lg font-medium text-primary tracking-tight">专注分析</text>
      <view class="w-8"></view>
    </view>

    <view class="flex-1 px-6 pb-24 overflow-y-auto hide-scrollbar pt-6">

      <!-- Hero Metric -->
      <view class="flex flex-col items-center mb-8">
        <view class="relative w-48 h-48 flex items-center justify-center">
          <!-- Conic Gradient for Distribution -->
          <view class="absolute inset-0 rounded-full" :style="{ background: 'conic-gradient(from 0deg, #1a1a1a 0%, #1a1a1a 62%, #e5e5e5 62%, #e5e5e5 85%, #d4d4d4 85%, #d4d4d4 100%)' }"></view>
          <view class="absolute inset-4 bg-gray-50 rounded-full flex flex-col items-center justify-center shadow-inner">
            <text class="text-xs text-secondary uppercase tracking-widest mb-1">Total Focus</text>
            <view class="flex items-baseline gap-1">
              <text class="font-display text-5xl font-bold text-primary">{{ totalHours }}</text>
              <text class="text-lg text-secondary font-medium">h</text>
            </view>
          </view>
        </view>

        <view class="flex gap-6 mt-6">
          <view class="flex items-center gap-2">
            <view class="w-3 h-3 rounded-full bg-primary"></view>
            <text class="text-xs text-secondary">Deep Work (62%)</text>
          </view>
          <view class="flex items-center gap-2">
            <view class="w-3 h-3 rounded-full bg-gray-300"></view>
            <text class="text-xs text-secondary">Light Work (23%)</text>
          </view>
        </view>
      </view>

      <!-- Trend Chart -->
      <view class="bg-white rounded-[32px] p-6 shadow-sm border border-black/5 mb-6">
        <view class="flex justify-between items-center mb-6">
          <text class="font-medium text-primary text-sm">本周趋势</text>
          <text class="text-[10px] text-green-600 bg-green-50 px-2 py-1 rounded-full font-medium">+12.5% Growth</text>
        </view>

        <view class="relative h-40 w-full">
          <!-- #ifdef H5 -->
          <svg width="100%" height="100%" :viewBox="`0 0 ${width} ${height}`" preserveAspectRatio="none" class="overflow-visible">
            <defs>
              <linearGradient id="gradient" x1="0" x2="0" y1="0" y2="1">
                <stop offset="0%" stop-color="#1a1a1a" stop-opacity="0.2" />
                <stop offset="100%" stop-color="#1a1a1a" stop-opacity="0" />
              </linearGradient>
            </defs>
            <path :d="areaPath" fill="url(#gradient)" />
            <path :d="linePath" fill="none" stroke="#1a1a1a" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" />
            <circle v-for="(p, i) in points" :key="i" :cx="p.x" :cy="p.y" r="3" fill="white" stroke="#1a1a1a" stroke-width="2" />
          </svg>
          <!-- #endif -->
          <!-- #ifndef H5 -->
          <view class="flex items-end justify-between h-full w-full px-2">
            <view
              v-for="(stat, i) in weeklyStats"
              :key="i"
              class="flex flex-col items-center gap-2"
              :style="{ width: '40rpx' }"
            >
              <view
                class="w-full rounded-t-sm transition-all duration-500"
                :style="{
                  height: `${(stat.hours / 8) * 100}%`,
                  background: 'linear-gradient(to top, #1a1a1a, #4a4a4a)'
                }"
              ></view>
            </view>
          </view>
          <!-- #endif -->

          <!-- X Axis Labels -->
          <view class="flex justify-between mt-4">
            <text v-for="s in weeklyStats" :key="s.day" class="text-[10px] text-gray-400 font-medium w-8 text-center">{{ s.day }}</text>
          </view>
        </view>
      </view>

      <!-- Insights Grid -->
      <view class="grid grid-cols-2 gap-4">
        <view class="bg-white p-5 rounded-[24px] border border-black/5 shadow-sm">
          <text class="text-[10px] text-secondary tracking-wide uppercase mb-2 block">Peak Time</text>
          <view class="flex items-center gap-2">
            <text class="material-symbols-outlined text-orange-500">wb_sunny</text>
            <text class="font-display text-lg font-bold text-primary">09:00</text>
          </view>
          <text class="text-[10px] text-gray-400 mt-2 leading-relaxed block">Most productive in the morning.</text>
        </view>
        <view class="bg-white p-5 rounded-[24px] border border-black/5 shadow-sm">
          <text class="text-[10px] text-secondary tracking-wide uppercase mb-2 block">Zone Preference</text>
          <view class="flex items-center gap-2">
            <text class="material-symbols-outlined text-indigo-500">location_on</text>
            <text class="font-serif text-lg font-medium text-primary">2F Silent</text>
          </view>
          <text class="text-[10px] text-gray-400 mt-2 leading-relaxed block">You love quiet places.</text>
        </view>
      </view>

    </view>
  </view>
</template>

<script setup lang="ts">
import { computed } from 'vue';

interface DailyStat {
  day: string;
  hours: number;
  date: string;
}

const weeklyStats: DailyStat[] = [
  { day: 'Mon', hours: 2.5, date: '10/21' },
  { day: 'Tue', hours: 4.8, date: '10/22' },
  { day: 'Wed', hours: 3.5, date: '10/23' },
  { day: 'Thu', hours: 6.2, date: '10/24' },
  { day: 'Fri', hours: 4.0, date: '10/25' },
  { day: 'Sat', hours: 7.5, date: '10/26' },
  { day: 'Sun', hours: 5.2, date: '10/27' },
];

const totalHours = computed(() =>
  weeklyStats.reduce((acc, curr) => acc + curr.hours, 0).toFixed(1)
);

// SVG Chart Generators
const generateSmoothPath = (points: {x: number, y: number}[]) => {
  if (points.length === 0) return '';
  const first = points[0];
  let path = `M ${first.x},${first.y}`;
  for (let i = 0; i < points.length - 1; i++) {
    const current = points[i];
    const next = points[i + 1];
    const controlPointX = (current.x + next.x) / 2;
    path += ` C ${controlPointX},${current.y} ${controlPointX},${next.y} ${next.x},${next.y}`;
  }
  return path;
};

const width = 300;
const height = 120;
const maxVal = 8;
const points = weeklyStats.map((stat, i) => ({
  x: (i / (weeklyStats.length - 1)) * width,
  y: height - (stat.hours / maxVal) * height
}));

const linePath = generateSmoothPath(points);
const areaPath = `${linePath} L ${width},${height} L 0,${height} Z`;

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

// 隐藏滚动条
.hide-scrollbar::-webkit-scrollbar {
  display: none;
}
.hide-scrollbar {
  -ms-overflow-style: none;
  scrollbar-width: none;
}

// SVG 样式
svg {
  display: block;
}
</style>
