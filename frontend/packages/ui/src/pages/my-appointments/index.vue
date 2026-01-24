<!-- 我的预约页 -->
<template>
  <view class="appointments-page">
    <!-- 头部 -->
    <view class="header">
      <text class="header-title">我的预约</text>
    </view>

    <!-- 预约列表 -->
    <view class="appointment-list">
      <view
        v-for="booking in bookings"
        :key="booking.id"
        class="appointment-card"
        :class="`status-${booking.status}`"
      >
        <view class="card-header">
          <view class="zone-info">
            <text class="zone-name">{{ booking.zoneName }}</text>
            <text class="seat-label">{{ booking.seatLabel }}</text>
          </view>
          <view class="status-badge" :class="`badge-${booking.status}`">
            {{ statusText[booking.status] }}
          </view>
        </view>

        <view class="card-body">
          <view class="info-row">
            <text class="info-icon">📅</text>
            <text class="info-text">{{ booking.bookingDate }}</text>
          </view>
          <view class="info-row">
            <text class="info-icon">⏰</text>
            <text class="info-text">{{ booking.startTime }} - {{ booking.endTime }}</text>
          </view>
        </view>

        <view class="card-footer">
          <view v-if="booking.status === 'confirmed'" class="action-buttons">
            <button class="action-btn secondary" @tap="handleCancel(booking.id)">
              取消预约
            </button>
            <button class="action-btn primary" @tap="handleCheckIn(booking.id)">
              签到
            </button>
          </view>
          <view v-else-if="booking.status === 'active'" class="action-buttons">
            <button class="action-btn primary" @tap="handleCheckOut(booking.id)">
              签退
            </button>
          </view>
        </view>
      </view>

      <!-- 空状态 -->
      <view v-if="bookings.length === 0" class="empty-state">
        <text class="empty-icon">📅</text>
        <text class="empty-text">暂无预约记录</text>
        <button class="empty-btn" @tap="goToBooking">
          立即预约
        </button>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useBooking } from '@zenspace/core/composables';
import { useToastStore } from '@zenspace/core/stores';
import { UniHttp } from '../../utils/adapters';
import type { Booking, BookingStatus } from '@zenspace/core/types';

const http = new UniHttp('http://localhost:3000/api/v1');
const { bookings, fetchBookings, cancelBooking, checkIn, checkOut } = useBooking({ http });
const toastStore = useToastStore();

const statusText: Record<BookingStatus, string> = {
  pending: '待支付',
  confirmed: '已确认',
  active: '进行中',
  completed: '已完成',
  cancelled: '已取消',
  no_show: '爽约',
};

// 模拟预约数据
const mockBookings: Booking[] = [
  {
    id: '1',
    userId: 'user-1',
    zoneId: 'zone-1',
    zoneName: '2F 静音研讨区',
    seatId: 'seat-1',
    seatLabel: 'A1',
    bookingDate: '2026-01-25',
    startTime: '14:00',
    endTime: '18:00',
    status: 'confirmed',
    amount: 60,
    createdAt: '2026-01-24T10:00:00',
  },
  {
    id: '2',
    userId: 'user-1',
    zoneId: 'zone-2',
    zoneName: '1F 综合阅览区',
    seatId: 'seat-2',
    seatLabel: 'B5',
    bookingDate: '2026-01-23',
    startTime: '09:00',
    endTime: '12:00',
    status: 'completed',
    amount: 45,
    createdAt: '2026-01-22T15:00:00',
  },
];

onMounted(() => {
  // 使用模拟数据
  bookings.value = mockBookings;
});

const handleCancel = async (id: string) => {
  uni.showModal({
    title: '取消预约',
    content: '确定要取消此预约吗？',
    success: async (res) => {
      if (res.confirm) {
        try {
          await cancelBooking(id);
        } catch {
          // 本地更新状态
          const index = bookings.value.findIndex((b) => b.id === id);
          if (index !== -1) {
            bookings.value[index].status = 'cancelled';
          }
        }
      }
    },
  });
};

const handleCheckIn = async (id: string) => {
  try {
    await checkIn(id);
    // 本地更新状态
    const index = bookings.value.findIndex((b) => b.id === id);
    if (index !== -1) {
      bookings.value[index].status = 'active';
    }
  } catch {
    toastStore.showError('签到失败');
  }
};

const handleCheckOut = async (id: string) => {
  try {
    await checkOut(id);
    // 本地更新状态
    const index = bookings.value.findIndex((b) => b.id === id);
    if (index !== -1) {
      bookings.value[index].status = 'completed';
    }
  } catch {
    toastStore.showError('签退失败');
  }
};

const goToBooking = () => {
  uni.switchTab({ url: '/pages/seat/index' });
};
</script>

<style lang="scss" scoped>
.appointments-page {
  min-height: 100vh;
  background: #F8F8F8;
  padding-bottom: 120rpx;
}

.header {
  padding: 120rpx 32rpx 32rpx;
  background: white;
}

.header-title {
  font-size: 48rpx;
  font-weight: bold;
  color: #1F2937;
}

.appointment-list {
  padding: 32rpx;
}

.appointment-card {
  background: white;
  border-radius: 32rpx;
  margin-bottom: 24rpx;
  overflow: hidden;
}

.card-header {
  padding: 32rpx;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1rpx solid #F3F4F6;
}

.zone-info {
  display: flex;
  flex-direction: column;
}

.zone-name {
  font-size: 32rpx;
  font-weight: bold;
  color: #1F2937;
  margin-bottom: 8rpx;
}

.seat-label {
  font-size: 24rpx;
  color: #6B7280;
}

.status-badge {
  padding: 8rpx 24rpx;
  border-radius: 100rpx;
  font-size: 24rpx;
  font-weight: bold;
}

.badge-confirmed {
  background: #DBEAFE;
  color: #1D4ED8;
}

.badge-active {
  background: #D1FAE5;
  color: #047857;
}

.badge-completed {
  background: #F3F4F6;
  color: #6B7280;
}

.badge-cancelled {
  background: #FEE2E2;
  color: #B91C1C;
}

.card-body {
  padding: 32rpx;
}

.info-row {
  display: flex;
  align-items: center;
  gap: 16rpx;
  margin-bottom: 16rpx;
}

.info-row:last-child {
  margin-bottom: 0;
}

.info-icon {
  font-size: 32rpx;
}

.info-text {
  font-size: 28rpx;
  color: #374151;
}

.card-footer {
  padding: 24rpx 32rpx;
  background: #F9FAFB;
  border-top: 1rpx solid #F3F4F6;
}

.action-buttons {
  display: flex;
  gap: 16rpx;
}

.action-btn {
  flex: 1;
  padding: 20rpx;
  border-radius: 16rpx;
  font-size: 28rpx;
  font-weight: bold;
  border: none;
}

.action-btn.primary {
  background: #4F46E5;
  color: white;
}

.action-btn.secondary {
  background: white;
  color: #1F2937;
  border: 1rpx solid #E5E7EB;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 120rpx 0;
}

.empty-icon {
  font-size: 120rpx;
  margin-bottom: 32rpx;
  opacity: 0.5;
}

.empty-text {
  font-size: 28rpx;
  color: #9CA3AF;
  margin-bottom: 48rpx;
}

.empty-btn {
  padding: 24rpx 64rpx;
  background: #4F46E5;
  color: white;
  border-radius: 24rpx;
  font-size: 28rpx;
  border: none;
}
</style>
