<!-- 个人中心页 -->
<template>
  <view class="profile-page">
    <!-- 用户信息头部 -->
    <view class="user-header">
      <view class="user-avatar">
        <image
          :src="userStore.user?.avatar || 'https://api.dicebear.com/7.x/micah/svg?seed=default'"
          class="avatar-img"
        />
        <view v-if="userStore.isVIP" class="vip-badge">VIP</view>
      </view>
      <text class="user-name">{{ userStore.user?.nickname || '未登录' }}</text>
      <text class="user-level">{{ userStore.userLevel }}</text>
    </view>

    <!-- 统计数据 -->
    <view class="stats-grid">
      <view class="stat-item">
        <text class="stat-value">{{ totalHours }}</text>
        <text class="stat-label">总时长(小时)</text>
      </view>
      <view class="stat-item">
        <text class="stat-value">{{ streakDays }}</text>
        <text class="stat-label">连续天数</text>
      </view>
      <view class="stat-item">
        <text class="stat-value">{{ userStore.user?.points || 0 }}</text>
        <text class="stat-label">积分</text>
      </view>
      <view class="stat-item">
        <text class="stat-value">12</text>
        <text class="stat-label">排名</text>
      </view>
    </view>

    <!-- 菜单列表 -->
    <view class="menu-list">
      <view class="menu-item" @tap="goToMyAppointments">
        <text class="menu-icon">📅</text>
        <text class="menu-label">我的预约</text>
        <text class="menu-arrow">→</text>
      </view>
      <view class="menu-item" @tap="goToWallet">
        <text class="menu-icon">💰</text>
        <text class="menu-label">钱包</text>
        <text class="menu-arrow">→</text>
      </view>
      <view class="menu-item" @tap="goToSettings">
        <text class="menu-icon">⚙️</text>
        <text class="menu-label">设置</text>
        <text class="menu-arrow">→</text>
      </view>
    </view>

    <!-- 登出按钮 -->
    <view v-if="userStore.isAuthenticated" class="logout-section">
      <button class="logout-btn" @tap="handleLogout">退出登录</button>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useUserStore } from '@zenspace/core/stores';
import { useAuth } from '@zenspace/core/composables';
import { UniHttp } from '../../utils/adapters';

const userStore = useUserStore();
const http = new UniHttp('http://localhost:3000/api/v1');
const { logout } = useAuth({ http });

const totalHours = ref(42);
const streakDays = ref(7);

// 跳转到我的预约
const goToMyAppointments = () => {
  uni.navigateTo({ url: '/pages/my-appointments/index' });
};

// 跳转到钱包
const goToWallet = () => {
  uni.navigateTo({ url: '/pages/wallet/index' });
};

// 跳转到设置
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
.profile-page {
  min-height: 100vh;
  background: #F8F8F8;
  padding-bottom: 120rpx;
}

.user-header {
  padding: 120rpx 0 80rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  background: white;
}

.user-avatar {
  position: relative;
  margin-bottom: 32rpx;
}

.avatar-img {
  width: 160rpx;
  height: 160rpx;
  border-radius: 50%;
}

.vip-badge {
  position: absolute;
  bottom: 0;
  right: 0;
  padding: 8rpx 24rpx;
  background: linear-gradient(135deg, #F59E0B 0%, #EF4444 100%);
  border-radius: 100rpx;
  font-size: 20rpx;
  font-weight: bold;
  color: white;
}

.user-name {
  font-size: 40rpx;
  font-weight: bold;
  color: #1F2937;
  margin-bottom: 8rpx;
}

.user-level {
  font-size: 28rpx;
  color: #6B7280;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 24rpx;
  padding: 32rpx;
}

.stat-item {
  background: white;
  border-radius: 32rpx;
  padding: 48rpx 32rpx;
  text-align: center;
}

.stat-value {
  font-size: 56rpx;
  font-weight: bold;
  color: #4F46E5;
  display: block;
  margin-bottom: 16rpx;
}

.stat-label {
  font-size: 24rpx;
  color: #6B7280;
}

.menu-list {
  padding: 0 32rpx;
}

.menu-item {
  background: white;
  border-radius: 24rpx;
  padding: 32rpx;
  margin-bottom: 16rpx;
  display: flex;
  align-items: center;
}

.menu-icon {
  font-size: 48rpx;
  margin-right: 24rpx;
}

.menu-label {
  flex: 1;
  font-size: 32rpx;
  color: #1F2937;
}

.menu-arrow {
  font-size: 32rpx;
  color: #9CA3AF;
}

.logout-section {
  padding: 64rpx 32rpx;
}

.logout-btn {
  width: 100%;
  padding: 32rpx;
  background: white;
  border-radius: 24rpx;
  font-size: 32rpx;
  color: #EF4444;
  border: 1rpx solid #FECACA;
}
</style>
