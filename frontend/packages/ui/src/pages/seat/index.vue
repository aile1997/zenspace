<!-- 选座页 -->
<template>
  <view class="seat-page">
    <!-- 头部 -->
    <view class="header">
      <view class="header-btn" @tap="goBack">
        <text>← 返回</text>
      </view>
      <text class="header-title">{{ zoneName }}</text>
      <view class="header-btn" @tap="openFilter">
        <text>⚙️</text>
      </view>
    </view>

    <!-- 座位地图 -->
    <view class="seat-map-container">
      <view class="seat-map">
        <!-- 窗户指示器 -->
        <view class="window-indicator left"></view>
        <view class="window-indicator right"></view>

        <!-- 座位网格 -->
        <view class="seat-grid">
          <view
            v-for="seat in seats"
            :key="seat.id"
            class="seat-item"
            :class="{
              'seat-occupied': seat.status !== 'available',
              'seat-selected': seat.id === selectedSeatId
            }"
            :style="getSeatStyle(seat)"
            @tap="handleSeatClick(seat)"
          >
            <text class="seat-label">{{ seat.label }}</text>
          </view>
        </view>
      </view>

      <!-- 图例 -->
      <view class="legend">
        <view class="legend-item">
          <view class="legend-dot available"></view>
          <text class="legend-text">空闲</text>
        </view>
        <view class="legend-item">
          <view class="legend-dot occupied"></view>
          <text class="legend-text">占用</text>
        </view>
        <view class="legend-item">
          <view class="legend-dot selected"></view>
          <text class="legend-text">已选</text>
        </view>
      </view>
    </view>

    <!-- 底部预约栏 -->
    <view class="bottom-bar">
      <view class="selected-info">
        <text class="selected-label">已选座位</text>
        <text class="selected-seat">{{ selectedSeatLabel || '未选择' }}</text>
      </view>
      <button
        class="booking-btn"
        :disabled="!selectedSeatId"
        @tap="handleBooking"
      >
        立即预约
      </button>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useSeat } from '@zenspace/core/composables';
import { useToastStore } from '@zenspace/core/stores';
import { UniHttp } from '../../utils/adapters';
import type { Seat } from '@zenspace/core/types';

const props = defineProps<{
  zone?: string;
}>();

const http = new UniHttp('http://localhost:3000/api/v1');
const { seats, selectSeat, clearSelection, getSelectedSeat, fetchZoneSeats } = useSeat({ http });
const toastStore = useToastStore();

const zoneName = ref('2F 静音研讨区');
const selectedSeatId = ref<string | null>(null);

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
        type: isWindow ? 'window' : 'standard',
        status: isOccupied ? 'occupied' : 'available',
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

const getSeatStyle = (seat: Seat) => {
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

  if (selectedSeatId.value === seat.id) {
    clearSelection();
    selectedSeatId.value = null;
  } else {
    selectSeat(seat.id);
    selectedSeatId.value = seat.id;
  }
};

const goBack = () => {
  uni.navigateBack();
};

const openFilter = () => {
  toastStore.showInfo('筛选功能开发中');
};

const handleBooking = () => {
  if (!selectedSeatId.value) return;
  toastStore.showSuccess('预约成功');
  setTimeout(() => {
    uni.navigateTo({ url: '/pages/my-appointments/index' });
  }, 1500);
};
</script>

<style lang="scss" scoped>
.seat-page {
  min-height: 100vh;
  background: #F8F8F8;
}

.header {
  padding: 120rpx 32rpx 32rpx;
  background: white;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-btn {
  font-size: 28rpx;
  color: #6B7280;
  padding: 16rpx;
}

.header-title {
  font-size: 36rpx;
  font-weight: bold;
  color: #1F2937;
}

.seat-map-container {
  padding: 48rpx 32rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.seat-map {
  position: relative;
  background: white;
  border-radius: 96rpx;
  padding: 80rpx;
  box-shadow: 0 16rpx 64rpx rgba(0, 0, 0, 0.1);
}

.window-indicator {
  position: absolute;
  top: 120rpx;
  bottom: 120rpx;
  width: 32rpx;
  background: rgba(186, 230, 253, 0.5);
  border: 1rpx solid white;
  border-radius: 16rpx;
  overflow: hidden;
}

.window-indicator.left {
  left: -24rpx;
  border-radius: 24rpx 0 0 24rpx;
}

.window-indicator.right {
  right: -24rpx;
  border-radius: 0 24rpx 24rpx 0;
}

.seat-grid {
  display: grid;
  grid-template-columns: repeat(6, 88rpx);
  grid-template-rows: repeat(8, 88rpx);
  gap: 24rpx 32rpx;
}

.seat-item {
  width: 88rpx;
  height: 88rpx;
  border-radius: 16rpx;
  background: white;
  border: 2rpx solid #E5E7EB;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
}

.seat-item.seat-occupied {
  background: #F3F4F6;
  border-color: #D1D5DB;
  opacity: 0.4;
}

.seat-item.seat-selected {
  background: #4F46E5;
  border-color: #4F46E5;
  transform: scale(1.1);
  box-shadow: 0 8rpx 24rpx rgba(79, 70, 229, 0.4);
  z-index: 10;
}

.seat-label {
  font-size: 24rpx;
  font-weight: bold;
  color: #1F2937;
}

.seat-item.seat-selected .seat-label {
  color: white;
}

.seat-item.seat-occupied .seat-label {
  color: #9CA3AF;
}

.legend {
  margin-top: 80rpx;
  display: flex;
  gap: 48rpx;
  background: white;
  padding: 24rpx 64rpx;
  border-radius: 96rpx;
  box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.05);
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 16rpx;
}

.legend-dot {
  width: 24rpx;
  height: 24rpx;
  border-radius: 8rpx;
}

.legend-dot.available {
  background: white;
  border: 2rpx solid #E5E7EB;
}

.legend-dot.occupied {
  background: #F3F4F6;
  border: 2rpx solid #D1D5DB;
}

.legend-dot.selected {
  background: #4F46E5;
  box-shadow: 0 4rpx 12rpx rgba(79, 70, 229, 0.4);
}

.legend-text {
  font-size: 24rpx;
  color: #6B7280;
  font-weight: bold;
}

.bottom-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: white;
  padding: 24rpx 32rpx;
  padding-bottom: calc(24rpx + env(safe-area-inset-bottom));
  display: flex;
  align-items: center;
  gap: 24rpx;
  box-shadow: 0 -4rpx 16rpx rgba(0, 0, 0, 0.05);
}

.selected-info {
  flex: 1;
}

.selected-label {
  font-size: 24rpx;
  color: #9CA3AF;
  display: block;
  margin-bottom: 8rpx;
}

.selected-seat {
  font-size: 36rpx;
  font-weight: bold;
  color: #1F2937;
}

.booking-btn {
  padding: 24rpx 64rpx;
  background: #1F2937;
  border-radius: 24rpx;
  font-size: 32rpx;
  color: white;
  font-weight: bold;
  border: none;
}

.booking-btn[disabled] {
  background: #E5E7EB;
  color: #9CA3AF;
}
</style>
