<!-- ZenSpace 首页 -->
<template>
  <view class="home-page">
    <!-- 头部区域 -->
    <view class="header">
      <view class="header-content">
        <view class="location-section">
          <text class="brand-tag">ZenSpace</text>
          <view class="location-info">
            <text class="location-name">丸の内</text>
            <text class="location-sub">中央馆</text>
          </view>
          <text class="expand-icon">▼</text>
        </view>
        <view class="notification-btn" @tap="goToNotifications">
          <text class="icon">🔔</text>
          <view class="notification-dot"></view>
        </view>
      </view>
    </view>

    <!-- 实时拥挤度 -->
    <view class="stats-section">
      <view class="section-header">
        <text class="section-tag">实时拥挤度</text>
        <view class="live-badge">
          <view class="live-dot"></view>
          <text class="live-text">Live</text>
        </view>
      </view>

      <view class="stats-card">
        <!-- 1F 综合阅览区 -->
        <view class="stat-item" @tap="handleZoneClick('1f')">
          <view class="stat-header">
            <text class="stat-label">1F 综合阅览区</text>
            <text class="stat-value">82<span class="stat-percent">%</span></text>
          </view>
          <view class="stat-bar">
            <view class="stat-bar-fill stat-busy" style="width: 82%"></view>
          </view>
        </view>

        <!-- 2F 静音研讨室 -->
        <view class="stat-item" @tap="handleZoneClick('2f')">
          <view class="stat-header">
            <text class="stat-label">2F 静音研讨室</text>
            <text class="stat-value">45<span class="stat-percent">%</span></text>
          </view>
          <view class="stat-bar">
            <view class="stat-bar-fill stat-moderate" style="width: 45%"></view>
          </view>
        </view>

        <!-- 3F 开放协作台 -->
        <view class="stat-item" @tap="handleZoneClick('3f')">
          <view class="stat-header">
            <text class="stat-label">3F 开放协作台</text>
            <text class="stat-value">12<span class="stat-percent">%</span></text>
          </view>
          <view class="stat-bar">
            <view class="stat-bar-fill stat-empty" style="width: 12%"></view>
          </view>
        </view>
      </view>
    </view>

    <!-- 功能卡片 -->
    <view class="features-section">
      <!-- 智能选座 -->
      <view class="feature-card" @tap="goToBooking">
        <view class="feature-image">
          <image
            src="https://images.unsplash.com/photo-1507537297725-24a1c434c67b?w=800"
            mode="aspectFill"
            class="feature-img"
          />
          <view class="feature-overlay"></view>
        </view>
        <view class="feature-content">
          <view class="feature-icon">💺</view>
          <text class="feature-title">智能\n选座</text>
          <view class="feature-divider"></view>
          <text class="feature-subtitle">Smart Booking</text>
        </view>
      </view>

      <!-- 积分商城 -->
      <view class="feature-card" @tap="goToRewards">
        <view class="feature-image">
          <image
            src="https://images.unsplash.com/photo-1616031036329-373b53c65c2b?w=800"
            mode="aspectFill"
            class="feature-img"
          />
          <view class="feature-overlay"></view>
        </view>
        <view class="feature-content">
          <view class="feature-icon">🛍️</view>
          <text class="feature-title">积分\n商城</text>
          <view class="feature-divider"></view>
          <text class="feature-subtitle">Rewards Club</text>
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

// 跳转到通知页
const goToNotifications = () => {
  uni.navigateTo({ url: '/pages/notifications/index' });
};

// 跳转到预约页
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
.home-page {
  min-height: 100vh;
  background: #F8F8F8;
  padding-bottom: 120rpx;
}

/* 头部 */
.header {
  padding: 120rpx 32rpx 32rpx;
  background: white;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
}

.location-section {
  display: flex;
  align-items: center;
  gap: 16rpx;
}

.brand-tag {
  font-size: 20rpx;
  font-weight: bold;
  letter-spacing: 0.1em;
  color: #14B8A6;
  text-transform: uppercase;
}

.location-info {
  display: flex;
  flex-direction: column;
}

.location-name {
  font-size: 56rpx;
  font-weight: 300;
  color: #1F2937;
  line-height: 1.2;
}

.location-sub {
  font-size: 40rpx;
  opacity: 0.6;
  color: #1F2937;
}

.expand-icon {
  font-size: 24rpx;
  color: #9CA3AF;
}

.notification-btn {
  position: relative;
  width: 80rpx;
  height: 80rpx;
  border-radius: 50%;
  border: 1rpx solid white;
  background: rgba(255, 255, 255, 0.4);
  backdrop-filter: blur(40rpx);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.05);
}

.notification-btn .icon {
  font-size: 40rpx;
}

.notification-dot {
  position: absolute;
  top: 24rpx;
  right: 24rpx;
  width: 12rpx;
  height: 12rpx;
  border-radius: 50%;
  background: #EF4444;
  border: 4rpx solid white;
}

/* 实时拥挤度 */
.stats-section {
  padding: 32rpx;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 32rpx;
  padding: 0 8rpx;
}

.section-tag {
  font-size: 20rpx;
  font-weight: bold;
  letter-spacing: 0.1em;
  color: #14B8A6;
  text-transform: uppercase;
}

.live-badge {
  display: flex;
  align-items: center;
  gap: 8rpx;
  padding: 8rpx 16rpx;
  border-radius: 100rpx;
  background: rgba(255, 255, 255, 0.8);
  border: 1rpx solid #F3F4F6;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.05);
}

.live-dot {
  position: relative;
  width: 12rpx;
  height: 12rpx;
  border-radius: 50%;
  background: #22C55E;
}

.live-dot::after {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: 50%;
  background: #22C55E;
  animation: live-ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;
}

@keyframes live-ping {
  75%, 100% {
    transform: scale(2);
    opacity: 0;
  }
}

.live-text {
  font-size: 18rpx;
  font-weight: bold;
  letter-spacing: 0.05em;
  color: #1F2937;
  text-transform: uppercase;
}

.stats-card {
  background: rgba(255, 255, 255, 0.6);
  backdrop-filter: blur(40rpx);
  border-radius: 48rpx;
  padding: 48rpx;
  box-shadow: 0 16rpx 64rpx rgba(0, 0, 0, 0.03);
  border: 1rpx solid white;
}

.stat-item {
  margin-bottom: 48rpx;
}

.stat-item:last-child {
  margin-bottom: 0;
}

.stat-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  margin-bottom: 16rpx;
}

.stat-label {
  font-size: 24rpx;
  color: #6B7280;
  font-weight: 500;
  letter-spacing: 0.05em;
}

.stat-value {
  font-size: 36rpx;
  color: #1F2937;
  font-weight: bold;
}

.stat-percent {
  font-size: 20rpx;
  color: #9CA3AF;
  font-weight: normal;
  margin-left: 4rpx;
}

.stat-bar {
  height: 16rpx;
  background: #F3F4F6;
  border-radius: 100rpx;
  overflow: hidden;
  padding: 2rpx;
}

.stat-bar-fill {
  height: 100%;
  border-radius: 100rpx;
  transition: width 1s ease;
}

.stat-busy {
  background: linear-gradient(to right, #4B5563, #1F2937, black);
}

.stat-moderate {
  background: linear-gradient(to right, #9CA3AF, #6B7280);
}

.stat-empty {
  background: linear-gradient(to right, #D1D5DB, #E5E7EB);
}

/* 功能卡片 */
.features-section {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 32rpx;
  padding: 0 32rpx;
}

.feature-card {
  position: relative;
  border-radius: 48rpx;
  overflow: hidden;
  background: white;
  box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.08);
  transition: all 0.5s ease;
}

.feature-card:active {
  transform: translateY(-8rpx);
  box-shadow: 0 24rpx 48rpx rgba(0, 0, 0, 0.12);
}

.feature-image {
  position: relative;
  width: 100%;
  aspect-ratio: 4/5;
}

.feature-img {
  width: 100%;
  height: 100%;
  transition: transform 1s ease;
}

.feature-card:active .feature-img {
  transform: scale(1.1);
}

.feature-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(to top, rgba(0, 0, 0, 0.8) 0%, rgba(0, 0, 0, 0.2) 50%, transparent 100%);
  opacity: 0.9;
}

.feature-content {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 40rpx;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}

.feature-icon {
  width: 72rpx;
  height: 72rpx;
  border-radius: 24rpx;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(40rpx);
  border: 1rpx solid rgba(255, 255, 255, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 36rpx;
  margin-bottom: 24rpx;
  box-shadow: 0 8rpx 32rpx rgba(0, 0, 0, 0.2);
}

.feature-title {
  font-size: 44rpx;
  font-weight: 300;
  color: white;
  letter-spacing: 0.05em;
  line-height: 1.2;
  white-space: pre-line;
}

.feature-divider {
  width: 56rpx;
  height: 2rpx;
  background: rgba(255, 255, 255, 0.4);
  margin: 24rpx 0 16rpx;
}

.feature-subtitle {
  font-size: 18rpx;
  color: rgba(255, 255, 255, 0.6);
  font-weight: 500;
  letter-spacing: 0.1em;
  text-transform: uppercase;
}
</style>
