<!-- ZenSpace 预约页 - 日期和区域选择 (iOS 18 风格优化版) -->
<template>
  <view class="booking-page">
    <!-- 头部 -->
    <view class="booking-header">
      <view class="header-content">
        <view class="header-text">
          <text class="header-title">预约座位</text>
          <text class="header-subtitle">Select Date & Zone</text>
        </view>
        <view class="close-btn" @tap="goBack">
          <text class="material-symbols-outlined">close</text>
        </view>
      </view>

      <!-- 日期选择器 -->
      <view class="date-selector">
        <view
          v-for="(date, index) in dates"
          :key="index"
          class="date-item"
          :class="{ 'date-item-active': selectedDate === index }"
          @tap="selectDate(index)"
        >
          <text class="date-week" :class="selectedDate === index ? 'text-white opacity-80' : 'text-gray-500 opacity-60'">
            {{ date.week }}
          </text>
          <text class="date-day" :class="selectedDate === index ? 'text-white' : 'text-gray-900'">
            {{ date.day }}
          </text>
        </view>
      </view>
    </view>

    <!-- 骨架屏加载状态 -->
    <view v-if="loading" class="zones-skeleton">
      <view v-for="i in 3" :key="i" class="skeleton-card">
        <view class="skeleton-image shimmer"></view>
        <view class="skeleton-content">
          <view class="skeleton-title shimmer"></view>
          <view class="skeleton-tags">
            <view class="skeleton-tag shimmer"></view>
            <view class="skeleton-tag shimmer"></view>
          </view>
          <view class="skeleton-footer">
            <view class="skeleton-text shimmer"></view>
            <view class="skeleton-bar shimmer"></view>
          </view>
        </view>
      </view>
    </view>

    <!-- 区域列表（真实数据） -->
    <view v-else class="zones-list">
      <view
        v-for="(zone, index) in zones"
        :key="zone.id"
        class="zone-card"
        :style="{ animationDelay: `${index * 100}ms` }"
        @tap="goToSeatSelection(zone.id)"
      >
        <!-- 状态标签 -->
        <view class="zone-status">
          <view class="status-dot" :class="getStatusDotClass(zone.status)"></view>
          <text>{{ zone.floor }}F</text>
        </view>

        <!-- 区域图片 -->
        <view class="zone-image">
          <image
            :src="zone.imageUrl || getDefaultImage(zone.floor)"
            mode="aspectFill"
            class="zone-img"
          />
          <view class="zone-image-overlay"></view>
        </view>

        <!-- 区域信息 -->
        <view class="zone-info">
          <view class="zone-left">
            <text class="zone-name">{{ zone.name }}</text>
            <view class="zone-tags">
              <text v-for="feature in zone.features.slice(0, 2)" :key="feature" class="zone-tag">
                {{ feature }}
              </text>
            </view>
          </view>

          <view class="zone-right">
            <view class="zone-availability">
              <text class="avail-label">剩余</text>
              <text class="avail-count">{{ zone.availableSeats }}</text>
              <text class="avail-unit">座位</text>
            </view>
            <view class="zone-meter">
              <view
                class="zone-meter-fill"
                :class="getMeterClass(zone.status)"
                :style="{ width: zone.occupancyRate + '%' }"
              ></view>
            </view>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useZoneStore } from '@zenspace/core/stores';
import { useToastStore } from '@zenspace/core/stores';
import { UniHttp } from '../../utils/adapters';

const http = new UniHttp('http://localhost:3000/api/v1');
const zoneStore = useZoneStore();
const toastStore = useToastStore();

const selectedDate = ref(0);
const loading = ref(true);

// 生成未来 7 天的日期
const generateDates = () => {
  const dates = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date();
    d.setDate(d.getDate() + i);
    dates.push({
      day: d.getDate(),
      week: ['日', '一', '二', '三', '四', '五', '六'][d.getDay()],
      full: d,
    });
  }
  return dates;
};

const dates = generateDates();

// 获取区域列表（computed）
const zones = computed(() => zoneStore.zones);

onMounted(async () => {
  try {
    loading.value = true;
    await zoneStore.fetchZones(http);
  } catch (err) {
    toastStore.showError('加载失败，请重试');
  } finally {
    // 延迟隐藏加载，让动画更流畅
    setTimeout(() => {
      loading.value = false;
    }, 300);
  }
});

// 选择日期
const selectDate = (index: number) => {
  selectedDate.value = index;
};

// 获取状态点样式
const getStatusDotClass = (status: string) => {
  switch (status) {
    case 'busy':
      return 'status-dot-busy';
    case 'moderate':
      return 'status-dot-moderate';
    case 'available':
    default:
      return 'status-dot-available';
  }
};

// 获取进度条样式
const getMeterClass = (status: string) => {
  switch (status) {
    case 'busy':
      return 'meter-busy';
    case 'moderate':
      return 'meter-moderate';
    case 'available':
    default:
      return 'meter-available';
  }
};

// 获取默认图片
const getDefaultImage = (floor: number) => {
  const images = [
    'https://images.unsplash.com/photo-1524813686514-a57563d77965?auto=format&fit=crop&q=80&w=800',
    'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80&w=800',
    'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?auto=format&fit=crop&q=80&w=800'
  ];
  return images[floor - 1] || images[0];
};

// 跳转到选座页
const goToSeatSelection = (zoneId: string) => {
  uni.navigateTo({ url: `/pages/seat/index?zone=${zoneId}` });
};

// 返回
const goBack = () => {
  uni.navigateBack();
};
</script>

<style lang="scss" scoped>
.booking-page {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background: white;
}

// 头部
.booking-header {
  padding: 128rpx 64rpx 64rpx;
  background: white;
  border-bottom: 1px solid #f3f4f6;
  position: sticky;
  top: 0;
  z-index: 20;
}

.header-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 64rpx;
}

.header-text {
  display: flex;
  flex-direction: column;
  gap: 16rpx;
}

.header-title {
  font-family: 'Noto Serif SC', serif;
  font-size: 48rpx;
  font-weight: 300;
  color: #1a1a1a;
  letter-spacing: -0.02em;
}

.header-subtitle {
  font-size: 20rpx;
  color: #8e8e93;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  font-weight: 700;
}

.close-btn {
  width: 80rpx;
  height: 80rpx;
  border-radius: 50%;
  background: white;
  border: 2rpx solid #f3f4f6;
  box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.04);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);

  &:active {
    transform: scale(0.95);
  }
}

// 日期选择器
.date-selector {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 24rpx;
  overflow-x: auto;
  padding-bottom: 16rpx;
  -webkit-overflow-scrolling: touch;

  &::-webkit-scrollbar {
    display: none;
  }
}

.date-item {
  min-width: 112rpx;
  height: 152rpx;
  border-radius: 44rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8rpx;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  background: white;
  color: #8e8e93;
  box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.04);
  border: 2rpx solid #f3f4f6;

  &:active {
    transform: scale(0.95);
  }
}

.date-item-active {
  background: #1a1a1a;
  color: white;
  box-shadow: 0 16rpx 40rpx rgba(26, 26, 26, 0.25);
  transform: translateY(-8rpx);
  border-color: #1a1a1a;
}

.date-week {
  font-size: 20rpx;
  font-weight: 500;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  margin-bottom: 4rpx;
}

.date-day {
  font-size: 48rpx;
  font-weight: 700;
}

// 区域列表
.zones-list {
  padding: 48rpx;
  display: flex;
  flex-direction: column;
  gap: 64rpx;
  padding-bottom: 128rpx;
}

.zone-card {
  position: relative;
  background: white;
  border-radius: 64rpx;
  overflow: hidden;
  box-shadow: 0 4rpx 24rpx rgba(0, 0, 0, 0.03);
  border: 1px solid #f3f4f6;
  animation: slide-up 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
  opacity: 0;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);

  &:active {
    transform: scale(0.98);
  }
}

@keyframes slide-up {
  from {
    opacity: 0;
    transform: translateY(80rpx);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

// 状态标签
.zone-status {
  position: absolute;
  top: 40rpx;
  right: 40rpx;
  z-index: 10;
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(24rpx);
  padding: 12rpx 24rpx;
  border-radius: 100rpx;
  font-size: 20rpx;
  font-weight: 700;
  color: #1a1a1a;
  box-shadow: 0 8rpx 24rpx rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
  gap: 12rpx;
  border: 2rpx solid rgba(255, 255, 255, 0.5);
}

.status-dot {
  width: 12rpx;
  height: 12rpx;
  border-radius: 50%;
}

.status-dot-busy {
  background: #ef4444;
  animation: pulse 2s infinite;
}

.status-dot-moderate {
  background: #f59e0b;
}

.status-dot-available {
  background: #22c55e;
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}

// 区域图片
.zone-image {
  height: 352rpx;
  width: 100%;
  position: relative;
  overflow: hidden;
  background: #f3f4f6;
}

.zone-img {
  width: 100%;
  height: 100%;
  transition: transform 1s cubic-bezier(0.4, 0, 0.2, 1);
}

.zone-card:active .zone-img {
  transform: scale(1.05);
}

.zone-image-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(to top, white, rgba(255, 255, 255, 0.1), transparent);
}

// 区域信息
.zone-info {
  padding: 64rpx;
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  position: relative;
  margin-top: -32rpx;
}

.zone-left {
  display: flex;
  flex-direction: column;
  gap: 24rpx;
}

.zone-name {
  font-family: 'Noto Serif SC', serif;
  font-size: 40rpx;
  font-weight: 500;
  color: #1a1a1a;
  background: rgba(255, 255, 255, 0.5);
  backdrop-filter: blur(8rpx);
  padding: 8rpx 16rpx;
  border-radius: 16rpx;
  margin-left: -16rpx;
}

.zone-tags {
  display: flex;
  gap: 16rpx;
}

.zone-tag {
  font-size: 20rpx;
  color: rgba(142, 142, 147, 0.7);
  background: #f9fafb;
  border: 2rpx solid #e5e7eb;
  padding: 12rpx 20rpx;
  border-radius: 16rpx;
  letter-spacing: 0.1em;
  font-weight: 500;
}

.zone-right {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 16rpx;
}

.zone-availability {
  font-size: 18rpx;
  color: #8e8e93;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.15em;
  display: flex;
  align-items: baseline;
  gap: 4rpx;
}

.avail-count {
  font-size: 40rpx;
  font-weight: 700;
  color: #1a1a1a;
  margin-left: 8rpx;
}

.zone-meter {
  width: 192rpx;
  height: 16rpx;
  background: #f3f4f6;
  border-radius: 100rpx;
  overflow: hidden;
  padding: 4rpx;
}

.zone-meter-fill {
  height: 100%;
  border-radius: 100rpx;
  transition: width 1s ease-out;
}

.meter-available {
  background: #22c55e;
}

.meter-moderate {
  background: #f59e0b;
}

.meter-busy {
  background: #ef4444;
}

// 骨架屏
.zones-skeleton {
  padding: 48rpx;
  display: flex;
  flex-direction: column;
  gap: 64rpx;
  padding-bottom: 128rpx;
}

.skeleton-card {
  background: white;
  border-radius: 64rpx;
  overflow: hidden;
  box-shadow: 0 4rpx 24rpx rgba(0, 0, 0, 0.03);
  border: 1px solid #f3f4f6;
}

.skeleton-image {
  height: 352rpx;
  width: 100%;
}

.skeleton-content {
  padding: 64rpx;
  display: flex;
  flex-direction: column;
  gap: 24rpx;
}

.skeleton-title {
  width: 200rpx;
  height: 40rpx;
  border-radius: 16rpx;
}

.skeleton-tags {
  display: flex;
  gap: 16rpx;
}

.skeleton-tag {
  width: 120rpx;
  height: 44rpx;
  border-radius: 16rpx;
}

.skeleton-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.skeleton-text {
  width: 150rpx;
  height: 24rpx;
  border-radius: 12rpx;
}

.skeleton-bar {
  width: 192rpx;
  height: 16rpx;
  border-radius: 100rpx;
}

// 骨架屏动画
.shimmer {
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
}

@keyframes shimmer {
  0% {
    background-position: 200% 0;
  }
  100% {
    background-position: -200% 0;
  }
}

// Material Icons
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
