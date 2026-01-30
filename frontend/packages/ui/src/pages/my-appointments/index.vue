<!-- ZenSpace 我的预约页 -->
<template>
  <view class="flex flex-col h-full bg-ios-gray min-h-screen">
    <!-- 头部 -->
    <view class="pt-14 pb-4 px-20 bg-white backdrop-blur sticky top-0 z-20 shadow-soft">
      <view class="flex items-center justify-between mb-6">
        <view class="flex items-center gap-4">
          <view class="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center" @tap="goBack">
            <text class="material-symbols-outlined text-gray-500 text-[18px]">arrow_back</text>
          </view>
          <text class="font-serif text-2xl font-medium text-primary tracking-tight">我的行程</text>
        </view>
        <view class="w-8 h-8 rounded-full flex items-center justify-center" @tap="goToCalendar">
          <text class="material-symbols-outlined text-primary">calendar_today</text>
        </view>
      </view>

      <!-- Tab 切换 -->
      <view class="flex gap-4">
        <view
          class="pb-2 text-sm font-medium transition-colors relative"
          :class="activeTab === 'upcoming' ? 'text-primary' : 'text-gray-400'"
          @tap="handleTabChange('upcoming')"
        >
          即将开始
          <view v-if="activeTab === 'upcoming'" class="absolute bottom-0 left-0 w-full h-0.5 bg-primary rounded-full"></view>
        </view>
        <view
          class="pb-2 text-sm font-medium transition-colors relative"
          :class="activeTab === 'history' ? 'text-primary' : 'text-gray-400'"
          @tap="handleTabChange('history')"
        >
          历史记录
          <view v-if="activeTab === 'history'" class="absolute bottom-0 left-0 w-full h-0.5 bg-primary rounded-full"></view>
        </view>
      </view>
    </view>

    <!-- 预约列表 -->
    <view class="p-20 flex flex-col gap-16 pb-24">
      <!-- 天气小组件（仅即将开始显示） -->
      <view v-if="activeTab === 'upcoming'" class="bg-gradient-to-br from-blue-50 to-white p-20 rd-24 flex items-center justify-between shadow-soft mb-8">
        <view class="flex items-center gap-3">
          <text class="material-symbols-outlined text-3xl text-orange-400">partly_cloudy_day</text>
          <view class="flex flex-col">
            <text class="text-xs font-medium text-primary">今天, Tokyo</text>
            <text class="text-[10px] text-secondary">24°C • 适宜出行</text>
          </view>
        </view>
        <view class="text-[10px] text-blue-500 bg-blue-100/50 px-2 py-1 rounded-md">Good for Walk</view>
      </view>

      <!-- 空状态 -->
      <view v-if="filteredBookings.length === 0" class="flex flex-col items-center justify-center py-20 opacity-50">
        <view class="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
          <text class="material-symbols-outlined text-4xl text-gray-300">confirmation_number</text>
        </view>
        <text class="text-xs text-secondary tracking-widest uppercase">No Appointments</text>
      </view>

      <!-- 预约卡片 -->
      <view
        v-for="booking in filteredBookings"
        :key="booking.id"
        class="group relative flex flex-col bg-white rd-24 shadow-soft overflow-hidden transition-all duration-300"
      >
        <!-- 顶部状态色条 -->
        <view
          class="h-2 w-full"
          :class="{
            'bg-[#1a1a1a]': booking.status === 'confirmed',
            'bg-green-500': booking.status === 'active',
            'bg-gray-300': booking.status === 'completed',
            'bg-red-300': booking.status === 'cancelled'
          }"
        ></view>

        <view class="p-20 pb-0 flex flex-col gap-16">
          <view class="flex justify-between items-start">
            <view>
              <text class="text-[10px] text-secondary tracking-wide uppercase block mb-1">Zone Area</text>
              <text class="font-serif text-xl font-medium text-primary block">{{ booking.zoneName }}</text>
            </view>
            <view class="text-right">
              <text class="text-[10px] text-secondary tracking-wide uppercase block mb-1">Seat No.</text>
              <text class="font-display text-2xl font-bold text-primary block">{{ booking.seatLabel }}</text>
            </view>
          </view>

          <view class="flex gap-4 p-3 bg-gray-50 rounded-xl border border-gray-100">
            <view class="flex-1">
              <text class="text-[10px] text-gray-400 block">Date</text>
              <text class="text-xs font-medium text-primary block">{{ formatBookingDate(booking.bookingDate) }}</text>
            </view>
            <view class="w-px bg-gray-200"></view>
            <view class="flex-1">
              <text class="text-[10px] text-gray-400 block">Time</text>
              <text class="text-xs font-medium text-primary block">{{ booking.startTime }} - {{ booking.endTime }}</text>
            </view>
          </view>
        </view>

        <!-- 票据撕裂线 -->
        <view class="relative h-8 w-full my-2 flex items-center">
          <view class="absolute left-[-10px] w-5 h-5 bg-gray-50 rounded-full shadow-inner border-r border-black/5"></view>
          <view class="w-full border-b-2 border-dashed border-gray-200 mx-6"></view>
          <view class="absolute right-[-10px] w-5 h-5 bg-gray-50 rounded-full shadow-inner border-l border-black/5"></view>
        </view>

        <!-- 底部操作区 -->
        <view class="px-20 pb-20 flex justify-between items-center">
          <view class="flex items-center gap-2">
            <view
              class="w-2 h-2 rounded-full"
              :class="{
                'bg-green-500 animate-pulse': booking.status === 'confirmed',
                'bg-green-500': booking.status === 'active',
                'bg-gray-300': booking.status === 'completed' || booking.status === 'cancelled'
              }"
            ></view>
            <text class="text-xs font-medium text-secondary">{{ getBookingStatusText(booking.status) }}</text>
          </view>

          <!-- 即将开始的操作按钮 -->
          <view v-if="activeTab === 'upcoming' && isConfirmed(booking.status)" class="flex gap-3">
            <view
              class="text-[11px] text-red-500 font-medium px-3 py-1.5 rd-12 transition-colors"
              @tap.stop="handleCancel(booking.id)"
            >
              Cancel
            </view>
            <view
              class="bg-primary text-white text-[11px] font-bold uppercase tracking-wider px-5 py-2 rd-12 shadow-soft transition-transform flex items-center gap-2"
              @tap.stop="showTicketDetail(booking)"
            >
              <text class="material-symbols-outlined text-[14px]">qr_code</text>
              <text>Ticket</text>
            </view>
          </view>

          <!-- 进行中的签退按钮 -->
          <view v-if="activeTab === 'upcoming' && isActive(booking.status)" class="flex gap-3">
            <view
              class="bg-success text-white text-[11px] font-bold uppercase tracking-wider px-5 py-2 rd-12 shadow-soft"
              @tap.stop="handleCheckOut(booking.id)"
            >
              签退
            </view>
          </view>
        </view>
      </view>
    </view>

    <!-- QR 码票务详情弹窗 -->
    <view v-if="showTicketModal && selectedTicket" class="fixed inset-0 z-50 flex items-center justify-center p-6 animate-fade-in" style="background: rgba(26, 26, 26, 0.9); backdrop-filter: blur(24px);" @tap="closeTicketModal">
      <view class="w-full max-w-sm bg-white rounded-[32px] overflow-hidden shadow-2xl" @tap.stop>
        <!-- 顶部区域 -->
        <view class="bg-primary p-8 text-center text-white relative overflow-hidden">
          <view class="absolute top-0 left-0 w-full h-full opacity-10" style="background: radial-gradient(circle, white 1px, transparent 1px); background-size: 16px 16px;"></view>
          <text class="font-serif text-2xl font-medium relative z-10 block">{{ selectedTicket.zoneName }}</text>
          <text class="text-white/60 text-sm mt-2 font-mono relative z-10 block">{{ formatBookingDate(selectedTicket.bookingDate) }} • {{ selectedTicket.startTime }}</text>
        </view>

        <!-- QR 码区域 -->
        <view class="p-8 flex flex-col items-center gap-6">
          <view class="w-64 h-64 border-2 border-black rounded-3xl p-2">
            <view class="w-full h-full bg-black flex items-center justify-center">
              <text class="material-symbols-outlined text-8xl" style="color: rgba(255, 255, 255, 0.2);">qr_code_2</text>
            </view>
          </view>
          <text class="text-xs text-secondary text-center max-w-[200px]">
            Scan this code at the entrance kiosk to access your seat.
          </text>
          <text class="text-primary text-sm font-bold underline" @tap="closeTicketModal">Close Ticket</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useBooking } from '@zenspace/core/composables';
import { useToastStore } from '@zenspace/core/stores';
import { UniHttp } from '../../utils/adapters';
import type { Booking } from '@zenspace/core/types';
import { BookingStatus } from '@zenspace/core/types';

const http = new UniHttp('http://localhost:3000/api/v1');
const { fetchBookings, cancelBooking, checkOut } = useBooking({ http });
const toastStore = useToastStore();

const activeTab = ref<'upcoming' | 'history'>('upcoming');
const showTicketModal = ref(false);
const selectedTicket = ref<Booking | null>(null);

// 本地预约数据
const localBookings = ref<Booking[]>([]);

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
    status: BookingStatus.CONFIRMED,
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
    status: BookingStatus.COMPLETED,
    amount: 45,
    createdAt: '2026-01-22T15:00:00',
  },
];

onMounted(() => {
  localBookings.value = mockBookings;
});

// 过滤预约列表
const filteredBookings = computed(() => {
  return localBookings.value.filter(booking => {
    if (activeTab.value === 'upcoming') {
      return booking.status === BookingStatus.CONFIRMED || booking.status === BookingStatus.ACTIVE;
    }
    return booking.status === BookingStatus.COMPLETED || booking.status === BookingStatus.CANCELLED;
  });
});

// 格式化预约日期
const formatBookingDate = (date: string) => {
  const d = new Date(date);
  return `${d.getMonth() + 1}月${d.getDate()}日`;
};

// 获取预约状态文本
const getBookingStatusText = (status: BookingStatus) => {
  const statusMap: Record<BookingStatus, string> = {
    [BookingStatus.CONFIRMED]: 'Ready to check-in',
    [BookingStatus.ACTIVE]: '进行中',
    [BookingStatus.COMPLETED]: 'Completed',
    [BookingStatus.CANCELLED]: 'Cancelled',
    [BookingStatus.PENDING]: '待支付',
    [BookingStatus.NO_SHOW]: '爽约',
  };
  return statusMap[status] || status;
};

// Tab 切换
const handleTabChange = (tab: 'upcoming' | 'history') => {
  activeTab.value = tab;
};

// 状态检查方法
const isConfirmed = (status: BookingStatus) => status === BookingStatus.CONFIRMED;
const isActive = (status: BookingStatus) => status === BookingStatus.ACTIVE;

// 取消预约
const handleCancel = async (id: string) => {
  uni.showModal({
    title: '取消预约',
    content: '确定要取消此预约吗？',
    success: async (res) => {
      if (res.confirm) {
        try {
          await cancelBooking(id);
          toastStore.showSuccess('预约已取消');
        } catch {
          // 本地更新状态
          const index = localBookings.value.findIndex((b) => b.id === id);
          if (index !== -1) {
            localBookings.value[index] = { ...localBookings.value[index], status: BookingStatus.CANCELLED };
          }
          toastStore.showSuccess('预约已取消');
        }
      }
    },
  });
};

// 签退
const handleCheckOut = async (id: string) => {
  try {
    await checkOut(id);
    toastStore.showSuccess('签退成功');
  } catch {
    // 本地更新状态
    const index = localBookings.value.findIndex((b) => b.id === id);
    if (index !== -1) {
      localBookings.value[index] = { ...localBookings.value[index], status: BookingStatus.COMPLETED };
    }
    toastStore.showSuccess('签退成功');
  }
};

// 显示票务详情
const showTicketDetail = (booking: Booking) => {
  selectedTicket.value = booking;
  showTicketModal.value = true;
};

// 关闭票务弹窗
const closeTicketModal = () => {
  showTicketModal.value = false;
  selectedTicket.value = null;
};

// 返回
const goBack = () => {
  uni.navigateBack();
};

// 日历
const goToCalendar = () => {
  toastStore.showInfo('日历功能开发中');
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

// 自定义动画
@keyframes fade-in {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.animate-fade-in {
  animation: fade-in 0.3s ease-out forwards;
}

// 字体映射
.font-serif {
  font-family: 'Noto Serif SC', serif;
}

.font-display {
  font-family: 'Manrope', sans-serif;
}

// 响应式交互
.hover\:bg-white {
  &:active {
    background-color: white;
  }
}

.hover\:shadow-lg {
  &:active {
    box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
  }
}

.active\:scale-\[0\.99\] {
  &:active {
    transform: scale(0.99);
  }
}

.hover\:scale-105 {
  &:active {
    transform: scale(1.05);
  }
}

.hover\:bg-red-50 {
  &:active {
    background-color: rgb(254, 242, 242);
  }
}
</style>
