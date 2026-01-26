<!-- ZenSpace 选座页 -->
<template>
  <view class="seat-page">
    <!-- 头部导航 -->
    <view class="seat-header">
      <view class="back-btn" @tap="goBack">
        <text class="material-symbols-outlined">arrow_back</text>
        <text>区域列表</text>
      </view>
      <text class="zone-name">{{ zoneName }}</text>
      <view class="icon-btn" @tap="openFilter">
        <text class="material-symbols-outlined">tune</text>
      </view>
    </view>

    <!-- 座位地图容器 -->
    <view class="seat-container">
      <!-- 装饰性地板网格 -->
      <view class="floor-grid"></view>

      <view class="seat-map">
        <!-- 窗户指示器 -->
        <view class="window-indicator window-left"></view>
        <view class="window-indicator window-right"></view>

        <!-- 座位网格 -->
        <view class="seat-grid-layout">
          <view
            v-for="seat in seats"
            :key="seat.id"
            class="seat-item"
            :class="getSeatClass(seat)"
            :style="getSeatPosition(seat)"
            @tap="handleSeatClick(seat)"
          >
            <!-- 椅背 -->
            <view class="seat-back"></view>
            <!-- 椅座 -->
            <view class="seat-cushion">
              <text class="seat-label">{{ seat.label }}</text>
            </view>
            <!-- 地板阴影 -->
            <view v-if="seat.id !== selectedSeatId" class="seat-shadow"></view>
            <!-- 选中脉冲环 -->
            <view v-if="seat.id === selectedSeatId" class="selected-pulse"></view>
          </view>
        </view>
      </view>

      <!-- 浮动图例 -->
      <view class="seat-legend">
        <view class="legend-item">
          <view class="legend-dot legend-available"></view>
          <text>空闲</text>
        </view>
        <view class="legend-item">
          <view class="legend-dot legend-occupied"></view>
          <text>占用</text>
        </view>
        <view class="legend-item">
          <view class="legend-dot legend-selected"></view>
          <text>已选</text>
        </view>
      </view>
    </view>

    <!-- 预约确认弹窗 Bottom Sheet -->
    <view v-if="showModal && selectedSeat" class="modal-overlay" @tap.self="closeModal">
      <view class="modal-content" :class="{ 'modal-show': showModal }">
        <!-- 拖动指示器 -->
        <view class="modal-handle"></view>

        <!-- 座位信息 -->
        <view class="modal-header">
          <text class="modal-title">预约确认</text>
          <text class="modal-subtitle">Booking Confirmation</text>
        </view>

        <view class="modal-body">
          <!-- 座位信息 -->
          <view class="info-row">
            <text class="info-label">预约座位</text>
            <view class="seat-number">
              <view class="status-dot status-active"></view>
              <text>{{ selectedSeatLabel }}</text>
            </view>
          </view>
          <view class="divider"></view>

          <!-- 时段信息 -->
          <view class="info-row">
            <text class="info-label">预约时段</text>
            <text class="info-value">14:00 - 18:00</text>
          </view>
          <view class="divider"></view>

          <!-- 支付金额 -->
          <view class="info-row">
            <text class="info-label">支付金额</text>
            <text class="price-value">¥50.00</text>
          </view>
        </view>

        <!-- 确认按钮 -->
        <view class="confirm-btn" @tap="handleConfirmBooking">
          <template v-if="bookingState === 'idle'">
            <text>确认支付</text>
            <text class="material-symbols-outlined">arrow_forward</text>
          </template>
          <text v-else class="material-symbols-outlined loading-icon">progress_activity</text>
        </view>

        <!-- 取消按钮 -->
        <text class="cancel-btn" @tap="closeModal">取消预约</text>
      </view>
    </view>

    <!-- 成功状态覆盖层 -->
    <view v-if="bookingState === 'success'" class="success-overlay">
      <view class="success-content">
        <view class="checkmark-circle">
          <text class="material-symbols-outlined">check</text>
        </view>
        <text class="success-title">预约成功</text>
        <text class="success-desc">请准时前往座位</text>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useSeat } from '@zenspace/core/composables';
import { useToastStore } from '@zenspace/core/stores';
import { UniHttp } from '../../utils/adapters';
import type { Seat } from '@zenspace/core/types';
import { SeatType, SeatStatus } from '@zenspace/core/types';

const props = defineProps<{
  zone?: string;
}>();

const http = new UniHttp('http://localhost:3000/api/v1');
const { seats, selectSeat, clearSelection, getSelectedSeat } = useSeat({ http });
const toastStore = useToastStore();

const zoneName = ref('2F 静音研讨区');
const selectedSeatId = ref<string | null>(null);
const showModal = ref(false);
const bookingState = ref<'idle' | 'processing' | 'success'>('idle');

// 生成模拟座位数据
const generateMockSeats = (): Seat[] => {
  const seats: Seat[] = [];
  const rows = 8;
  const cols = 6;

  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      // 走廊空位
      if ((x === 2 || x === 3) && y !== 0 && y !== 7) continue;

      const id = `${String.fromCharCode(65 + y)}${x + 1}`;
      const isWindow = x === 0 || x === 5;
      const isOccupied = Math.random() < 0.3;

      seats.push({
        id,
        zoneId: 'zone-1',
        label: id,
        type: isWindow ? SeatType.WINDOW : SeatType.STANDARD,
        status: isOccupied ? SeatStatus.OCCUPIED : SeatStatus.AVAILABLE,
        x,
        y,
      });
    }
  }
  return seats;
};

onMounted(() => {
  seats.value = generateMockSeats();
});

const selectedSeatLabel = computed(() => {
  const seat = getSelectedSeat();
  return seat?.label || '';
});

const selectedSeat = computed(() => {
  return seats.value.find(s => s.id === selectedSeatId.value);
});

// 获取座位样式类
const getSeatClass = (seat: Seat) => {
  return {
    'seat-occupied': seat.status !== 'available',
    'seat-available': seat.status === 'available',
    'seat-selected': seat.id === selectedSeatId.value,
  };
};

// 获取座位位置
const getSeatPosition = (seat: Seat) => {
  return {
    gridColumn: seat.x + 1,
    gridRow: seat.y + 1,
  };
};

const handleSeatClick = (seat: Seat) => {
  if (seat.status !== 'available') {
    toastStore.showError('该座位不可选');
    return;
  }

  // 如果点击已选座位，取消选择
  if (selectedSeatId.value === seat.id) {
    clearSelection();
    selectedSeatId.value = null;
  } else {
    selectSeat(seat.id);
    selectedSeatId.value = seat.id;
    showModal.value = true;
  }
};

const closeModal = () => {
  showModal.value = false;
};

const handleConfirmBooking = () => {
  if (!selectedSeatId.value) return;

  bookingState.value = 'processing';

  // 模拟 API 请求
  setTimeout(() => {
    bookingState.value = 'success';
    toastStore.showSuccess('预约成功，座席已为您保留');

    setTimeout(() => {
      uni.navigateTo({ url: '/pages/my-appointments/index' });
    }, 2000);
  }, 1500);
};

const goBack = () => {
  uni.navigateBack();
};

const openFilter = () => {
  toastStore.showInfo('筛选功能开发中');
};
</script>

<style lang="scss" scoped>
.seat-page {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background: #f9fafb;
  position: relative;
}

// 头部
.seat-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 128rpx 48rpx 48rpx;
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(24rpx);
  border-bottom: 1px solid rgba(255, 255, 255, 0.5);
  box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.05);
  z-index: 20;
}

.back-btn {
  display: flex;
  align-items: center;
  gap: 6rpx;
  color: #8e8e93;
  font-size: 28rpx;
  padding-left: 16rpx;
}

.zone-name {
  font-family: 'Noto Serif SC', serif;
  font-size: 36rpx;
  font-weight: 500;
  color: #1a1a1a;
}

.icon-btn {
  width: 80rpx;
  height: 80rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
}

// 座位容器
.seat-container {
  flex: 1;
  overflow: auto;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 64rpx;
  position: relative;
}

// 地板网格
.floor-grid {
  position: absolute;
  inset: 0;
  background-image: radial-gradient(#d1d5db 1px, transparent 1px);
  background-size: 48rpx 48rpx;
  opacity: 0.4;
  pointer-events: none;
}

// 座位地图
.seat-map {
  position: relative;
  padding: 80rpx;
  background: white;
  border-radius: 120rpx;
  box-shadow: 0 32rpx 64rpx rgba(0, 0, 0, 0.08);
  border: 12rpx solid white;
  box-shadow: 0 0 0 2rpx rgba(0, 0, 0, 0.05);
  min-width: 640rpx;
}

// 窗户指示器
.window-indicator {
  position: absolute;
  top: 128rpx;
  bottom: 128rpx;
  width: 40rpx;
  background: rgba(224, 242, 254, 0.8);
  border: 2rpx solid white;
  overflow: hidden;
  backdrop-filter: blur(8rpx);
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.05);

  &::before {
    content: '';
    position: absolute;
    top: 0;
    width: 2rpx;
    height: 100%;
    background: rgba(255, 255, 255, 0.5);
  }

  &::after {
    content: '';
    position: absolute;
    top: -100%;
    left: 0;
    width: 100%;
    height: 400%;
    background: linear-gradient(to bottom, transparent, rgba(255, 255, 255, 0.8), transparent);
    transform: rotate(-12deg);
    opacity: 0.3;
  }
}

.window-left {
  left: -48rpx;
  border-radius: 32rpx 0 0 32rpx;

  &::before {
    right: 0;
  }
}

.window-right {
  right: -48rpx;
  border-radius: 0 32rpx 32rpx 0;

  &::before {
    left: 0;
  }
}

// 座位网格布局
.seat-grid-layout {
  display: grid;
  grid-template-columns: repeat(6, 80rpx);
  grid-template-rows: repeat(8, 80rpx);
  gap: 20rpx 24rpx;
}

// 座位项
.seat-item {
  position: relative;
  width: 80rpx;
  height: 80rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-end;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.seat-back {
  width: 64rpx;
  height: 24rpx;
  border-radius: 16rpx 16rpx 0 0;
  margin-bottom: 2rpx;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.1);
  border: 2rpx solid;
  border-bottom: none;
  transition: all 0.3s;
  position: relative;
  z-index: 0;
  margin: 0 auto;
}

.seat-cushion {
  width: 80rpx;
  height: 64rpx;
  border-radius: 16rpx;
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s;
  position: relative;
  z-index: 10;
  border: 2rpx solid;
}

.seat-label {
  font-size: 20rpx;
  font-weight: 700;
  font-family: 'Courier New', monospace;
}

.seat-shadow {
  position: absolute;
  bottom: -20rpx;
  width: 48rpx;
  height: 8rpx;
  background: rgba(0, 0, 0, 0.1);
  border-radius: 50%;
  filter: blur(6rpx);
  transition: all 0.3s;
}

// 可用座位
.seat-available {
  cursor: pointer;

  .seat-back {
    background: white;
    border-color: #d1d5db;
  }

  .seat-cushion {
    background: #f9fafb;
    color: #8e8e93;
    border-color: #e5e7eb;
  }

  .seat-shadow {
    width: 64rpx;
    filter: blur(16rpx);
    background: rgba(26, 26, 26, 0.1);
  }

  &:active {
    transform: scale(1.05);

    .seat-shadow {
      width: 72rpx;
      filter: blur(20rpx);
    }
  }
}

// 已占用座位
.seat-occupied {
  cursor: not-allowed;
  opacity: 0.4;
  filter: grayscale(1);

  .seat-back {
    background: #e5e7eb;
    border-color: #d1d5db;
  }

  .seat-cushion {
    background: #f3f4f6;
    color: #9ca3af;
    border-color: #e5e7eb;
  }
}

// 已选座位
.seat-selected {
  z-index: 10;
  transform: scale(1.1);

  .seat-back {
    background: #1a1a1a;
    border-color: #1a1a1a;
  }

  .seat-cushion {
    background: #1a1a1a;
    color: white;
    border-color: #1a1a1a;
    box-shadow: 0 16rpx 32rpx rgba(26, 26, 26, 0.3);
    transform: translateY(-8rpx);
  }

  .seat-shadow {
    display: none;
  }
}

// 选中脉冲环
.selected-pulse {
  position: absolute;
  inset: -12rpx;
  border-radius: 28rpx;
  border: 4rpx solid #667eea;
  animation: pulse-ring 1.5s infinite;
}

@keyframes pulse-ring {
  0%, 100% {
    opacity: 1;
    transform: scale(1);
  }
  50% {
    opacity: 0.5;
    transform: scale(1.1);
  }
}

// 图例
.seat-legend {
  position: absolute;
  bottom: 128rpx;
  left: 0;
  right: 0;
  display: flex;
  justify-content: center;
  gap: 64rpx;
  padding: 24rpx 64rpx;
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(24rpx);
  border-radius: 100rpx;
  box-shadow: 0 16rpx 32rpx rgba(0, 0, 0, 0.05);
  border: 2rpx solid white;
  box-shadow: 0 0 0 2rpx rgba(0, 0, 0, 0.05);
  pointer-events: none;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 16rpx;
}

.legend-dot {
  width: 24rpx;
  height: 24rpx;
  border-radius: 50%;
}

.legend-available {
  background: white;
  border: 2rpx solid #d1d5db;
}

.legend-occupied {
  background: rgba(229, 231, 235, 0.7);
  border: 2rpx solid #e5e7eb;
}

.legend-selected {
  background: #1a1a1a;
  box-shadow: 0 8rpx 16rpx rgba(26, 26, 26, 0.3);
}

// 弹窗遮罩
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(16rpx);
  z-index: 100;
  display: flex;
  align-items: flex-end;
}

.modal-content {
  width: 100%;
  max-height: 80vh;
  background: white;
  border-radius: 96rpx 96rpx 0 0;
  padding: 64rpx 64rpx 48rpx;
  box-shadow: 0 -16rpx 64rpx rgba(0, 0, 0, 0.1);
  transform: translateY(100%);
  transition: transform 0.4s cubic-bezier(0.16, 1, 0.3, 1);
}

.modal-show {
  transform: translateY(0);
}

.modal-handle {
  width: 160rpx;
  height: 16rpx;
  background: #e5e7eb;
  border-radius: 100rpx;
  margin: 0 auto 64rpx;
}

.modal-header {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 64rpx;
}

.modal-title {
  font-family: 'Noto Serif SC', serif;
  font-size: 44rpx;
  font-weight: 500;
  color: #1a1a1a;
  margin-bottom: 8rpx;
}

.modal-subtitle {
  font-size: 22rpx;
  color: #9ca3af;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  font-weight: 500;
}

.modal-body {
  display: flex;
  flex-direction: column;
  gap: 48rpx;
  margin-bottom: 64rpx;
}

.info-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.info-label {
  font-size: 26rpx;
  color: #9ca3af;
  font-weight: 500;
  letter-spacing: 0.1em;
}

.seat-number {
  display: flex;
  align-items: center;
  gap: 8rpx;
  font-family: 'Noto Serif SC', serif;
  font-size: 34rpx;
  font-weight: 500;
  color: #1a1a1a;
  letter-spacing: 0.05em;
}

.status-dot {
  width: 12rpx;
  height: 12rpx;
  border-radius: 50%;
}

.status-active {
  background: #22c55e;
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}

.info-value {
  font-size: 30rpx;
  color: #1a1a1a;
  font-weight: 500;
  letter-spacing: -0.02em;
}

.price-value {
  font-family: 'Noto Serif SC', serif;
  font-size: 48rpx;
  font-weight: 500;
  color: #1a1a1a;
}

.divider {
  height: 2rpx;
  background: #f3f4f6;
}

.confirm-btn {
  width: 100%;
  padding: 32rpx;
  background: #1a1a1a;
  color: white;
  border-radius: 48rpx;
  font-size: 30rpx;
  font-weight: 500;
  letter-spacing: 0.15em;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16rpx;
  box-shadow: 0 16rpx 48rpx rgba(0, 0, 0, 0.15);
  transition: all 0.3s;

  &:active {
    transform: scale(0.98);
    box-shadow: 0 8rpx 24rpx rgba(0, 0, 0, 0.15);
  }
}

.cancel-btn {
  display: block;
  text-align: center;
  margin-top: 32rpx;
  font-size: 26rpx;
  color: #9ca3af;
  letter-spacing: 0.1em;
  font-weight: 500;
}

// 成功覆盖层
.success-overlay {
  position: absolute;
  inset: 0;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(32rpx);
  z-index: 200;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.success-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  animation: zoom-in 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55);
}

@keyframes zoom-in {
  from {
    opacity: 0;
    transform: scale(0.3);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

.checkmark-circle {
  width: 192rpx;
  height: 192rpx;
  border-radius: 50%;
  background: #22c55e;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 96rpx;
  box-shadow: 0 32rpx 64rpx rgba(34, 197, 94, 0.3);
}

.checkmark-circle .material-symbols-outlined {
  font-size: 96rpx;
  color: white;
}

.success-title {
  font-family: 'Noto Serif SC', serif;
  font-size: 60rpx;
  font-weight: 500;
  color: #1a1a1a;
  margin-bottom: 24rpx;
}

.success-desc {
  font-size: 28rpx;
  color: #8e8e93;
  font-weight: 300;
}

// Loading 动画
.loading-icon {
  font-size: 40rpx;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
