<!-- ZenSpace 选座页 -->
<template>
  <view class="flex flex-col h-screen bg-gray-50 relative">
    <!-- 头部导航 -->
    <view class="pt-16 pb-6 px-6 bg-white/80 backdrop-blur-xl z-20 flex justify-between items-center shadow-sm border-b border-white/50">
      <view class="flex items-center gap-1.5 text-secondary pl-2" @tap="goBack">
        <text class="material-symbols-outlined text-[20px]">arrow_back</text>
        <text class="text-sm font-medium tracking-wide">区域列表</text>
      </view>
      <text class="font-serif text-lg font-medium text-primary">{{ zoneName }}</text>
      <view class="w-10 h-10 flex items-center justify-center rounded-full" @tap="openFilter">
        <text class="material-symbols-outlined text-[20px]">tune</text>
      </view>
    </view>

    <!-- 座位地图容器 -->
    <view class="flex-1 overflow-auto flex items-center justify-center p-8 relative">
      <!-- 装饰性地板网格 -->
      <view class="absolute inset-0 pointer-events-none opacity-40" style="background: radial-gradient(#d1d5db 1px, transparent 1px); background-size: 24px 24px;"></view>

      <view class="relative p-10 bg-white rounded-[60px] shadow-2xl shadow-gray-200/50 border-[6px] border-white ring-1 ring-gray-100" style="min-width: 320px;">
        <!-- 窗户指示器带反射效果 -->
        <view class="absolute -left-6 top-16 bottom-16 w-5 bg-sky-50/80 border border-white rounded-l-2xl overflow-hidden backdrop-blur-sm shadow-sm">
          <view class="absolute top-0 right-0 w-[1px] h-full bg-white/50"></view>
          <view class="absolute top-[-50%] left-0 w-full h-[200%] bg-gradient-to-b from-transparent via-white/80 to-transparent -rotate-12 opacity-30"></view>
        </view>
        <view class="absolute -right-6 top-16 bottom-16 w-5 bg-sky-50/80 border border-white rounded-r-2xl overflow-hidden backdrop-blur-sm shadow-sm">
          <view class="absolute top-0 left-0 w-[1px] h-full bg-white/50"></view>
          <view class="absolute top-[-50%] left-0 w-full h-[200%] bg-gradient-to-b from-transparent via-white/80 to-transparent -rotate-12 opacity-30"></view>
        </view>

        <!-- 座位网格 -->
        <view class="grid gap-x-5 gap-y-6" style="grid-template-columns: repeat(6, 40px); grid-template-rows: repeat(8, 40px);">
          <view
            v-for="seat in seats"
            :key="seat.id"
            class="relative w-10 h-10 flex flex-col items-center justify-end transition-all duration-300"
            :class="{
              'cursor-not-allowed opacity-40 grayscale': seat.status !== 'available',
              'cursor-pointer': seat.status === 'available',
              'z-10 scale-115': seat.id === selectedSeatId,
              'z-0 hover:scale-105': seat.status === 'available' && seat.id !== selectedSeatId
            }"
            :style="{
              gridColumn: seat.x + 1,
              gridRow: seat.y + 1
            }"
            @tap="handleSeatClick(seat)"
          >
            <!-- 椅背 -->
            <view
              class="w-[80%] h-3 rounded-t-lg mb-[1px] shadow-sm border border-b-0 transition-colors duration-300 relative z-0 mx-auto"
              :class="{
                'bg-primary border-primary': seat.id === selectedSeatId,
                'bg-gray-200 border-gray-300': seat.status !== 'available',
                'bg-white border-gray-300': seat.status === 'available' && seat.id !== selectedSeatId
              }"
            ></view>

            <!-- 椅座 -->
            <view
              class="w-full h-8 rounded-lg shadow-sm flex items-center justify-center transition-colors duration-300 relative z-10 border"
              :class="{
                'bg-primary text-white shadow-xl shadow-primary/30 border-primary translate-y-[-2px]': seat.id === selectedSeatId,
                'bg-gray-100 text-gray-400 border-gray-200': seat.status !== 'available',
                'bg-gray-50 text-secondary border-gray-200': seat.status === 'available' && seat.id !== selectedSeatId
              }"
            >
              <text class="text-[10px] font-bold font-mono">{{ seat.label }}</text>
            </view>

            <!-- 地板阴影 -->
            <view
              v-if="seat.id !== selectedSeatId"
              class="absolute -bottom-2.5 w-6 h-1 bg-black/10 rounded-full blur-[3px] transition-all"
              :class="{
                'w-8 blur-[4px] bg-primary/20': seat.status === 'available'
              }"
            ></view>
          </view>
        </view>
      </view>

      <!-- 浮动图例 -->
      <view class="absolute bottom-32 left-0 right-0 flex justify-center z-10 pointer-events-none">
        <view class="bg-white/80 backdrop-blur-xl px-8 py-3 rounded-full flex gap-8 shadow-2xl shadow-black/5 border border-white ring-1 ring-black/5">
          <view class="flex items-center gap-2">
            <view class="w-3 h-3 rounded bg-white border border-gray-300"></view>
            <text class="text-[10px] text-secondary font-bold tracking-wide">空闲</text>
          </view>
          <view class="flex items-center gap-2">
            <view class="w-3 h-3 rounded bg-gray-200/70 border border-gray-200"></view>
            <text class="text-[10px] text-gray-400 font-bold tracking-wide">占用</text>
          </view>
          <view class="flex items-center gap-2">
            <view class="w-3 h-3 rounded bg-primary shadow-lg shadow-primary/30"></view>
            <text class="text-[10px] text-primary font-bold tracking-wide">已选</text>
          </view>
        </view>
      </view>
    </view>

    <!-- 预约确认弹窗 -->
    <view v-if="showModal && selectedSeat" class="fixed inset-0 z-50 flex items-center justify-center px-8">
      <!-- 背景遮罩 -->
      <view
        class="absolute inset-0 bg-secondary/30 backdrop-blur-md transition-opacity duration-300"
        @tap="closeModal"
      ></view>

      <!-- 弹窗内容 -->
      <view class="relative w-full max-w-[340px] bg-white rounded-[32px] shadow-2xl overflow-hidden">
        <!-- 顶部渐变 -->
        <view class="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-gray-50/80 to-transparent pointer-events-none"></view>

        <view class="relative p-8 flex flex-col items-center">
          <text class="font-serif text-[22px] font-medium text-primary mb-1 tracking-tight">预约确认</text>
          <text class="text-[11px] text-gray-400 tracking-widest uppercase mb-8 font-medium">Booking Confirmation</text>

          <view class="w-full flex flex-col gap-6 mb-8">
            <!-- 座位信息 -->
            <view class="flex items-center justify-between">
              <text class="text-[13px] text-gray-400 font-medium tracking-wide">预约座位</text>
              <view class="flex items-center gap-2">
                <view class="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></view>
                <text class="font-serif text-[17px] text-primary font-medium tracking-wide">{{ selectedSeatLabel }}</text>
              </view>
            </view>
            <view class="h-px w-full bg-gray-100"></view>

            <!-- 时段信息 -->
            <view class="flex items-center justify-between">
              <text class="text-[13px] text-gray-400 font-medium tracking-wide">预约时段</text>
              <text class="font-sans text-[15px] text-primary font-medium tracking-tight">14:00 - 18:00</text>
            </view>
            <view class="h-px w-full bg-gray-100"></view>

            <!-- 支付金额 -->
            <view class="flex items-center justify-between pt-1">
              <text class="text-[13px] text-gray-400 font-medium tracking-wide">支付金额</text>
              <text class="font-serif text-2xl text-primary font-medium">¥50.00</text>
            </view>
          </view>

          <view
            class="w-full bg-[#333333] text-white py-4 rounded-2xl font-medium text-[15px] tracking-widest shadow-lg shadow-gray-200 transition-all active:scale-[0.98] flex items-center justify-center gap-2"
            @tap="handleConfirmBooking"
          >
            <text v-if="bookingState === 'idle'">确认支付</text>
            <text v-if="bookingState === 'idle'" class="material-symbols-outlined text-[16px] opacity-80">arrow_forward</text>
            <text v-else class="material-symbols-outlined animate-spin text-[20px]">progress_activity</text>
          </view>

          <text
            class="mt-4 text-[13px] text-gray-400 transition-colors tracking-wide font-medium"
            @tap="closeModal"
          >
            取消预约
          </text>
        </view>
      </view>
    </view>

    <!-- 成功状态覆盖层 -->
    <view v-if="bookingState === 'success'" class="absolute inset-0 z-50 bg-white/95 backdrop-blur-xl flex flex-col items-center justify-center">
      <view class="w-24 h-24 rounded-full bg-green-500 flex items-center justify-center mb-8 shadow-2xl shadow-green-500/30">
        <text class="material-symbols-outlined text-white text-[48px]">check</text>
      </view>
      <text class="font-serif text-3xl text-primary font-medium mb-3">预约成功</text>
      <text class="text-secondary text-sm font-light">Prepare for your flow state.</text>
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
const { seats, selectSeat, clearSelection, getSelectedSeat, fetchZoneSeats } = useSeat({ http });
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
    // 显示预约确认弹窗
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

    // 跳转到我的预约页
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
@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.animate-spin {
  animation: spin 1s linear infinite;
}

// 颜色变量映射（用于 inline styles 和动态类）
.bg-secondary\/30 {
  background-color: rgba(74, 74, 74, 0.3);
}

.bg-black\/10 {
  background-color: rgba(0, 0, 0, 0.1);
}

.bg-primary\/20 {
  background-color: rgba(26, 26, 26, 0.2);
}

.shadow-primary\/30 {
  box-shadow: 0 10px 15px -3px rgba(26, 26, 26, 0.3);
}

.bg-white\/50 {
  background-color: rgba(255, 255, 255, 0.5);
}

.bg-white\/80 {
  background-color: rgba(255, 255, 255, 0.8);
}

.bg-white\/95 {
  background-color: rgba(255, 255, 255, 0.95);
}

.bg-sky-50\/80 {
  background-color: rgba(224, 242, 254, 0.8);
}

.bg-gray-200\/70 {
  background-color: rgba(229, 231, 235, 0.7);
}

.bg-gray-50\/80 {
  background-color: rgba(249, 250, 251, 0.8);
}

.bg-black\/5 {
  background-color: rgba(0, 0, 0, 0.05);
}

.backdrop-blur-md {
  backdrop-filter: blur(12px);
}

.backdrop-blur-xl {
  backdrop-filter: blur(24px);
}

.backdrop-blur-sm {
  backdrop-filter: blur(4px);
}

// 响应式调整
.hover\:scale-105 {
  &:active {
    transform: scale(1.05);
  }
}

.hover\:scale-115 {
  &:active {
    transform: scale(1.15);
  }
}

.hover\:text-primary {
  &:active {
    color: #1a1a1a;
  }
}

.hover\:bg-white {
  &:active {
    background-color: white;
  }
}

.hover\:w-8 {
  &:active {
    width: 32px;
  }
}

.hover\:blur-\[4px\] {
  &:active {
    filter: blur(4px);
  }
}

.hover\:border-primary {
  &:active {
    border-color: #1a1a1a;
  }
}

.hover\:bg-primary\/20 {
  &:active {
    background-color: rgba(26, 26, 26, 0.2);
  }
}
</style>
