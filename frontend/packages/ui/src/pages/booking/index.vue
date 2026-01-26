<!-- ZenSpace 预约页 - 日期和区域选择 -->
<template>
  <view class="flex flex-col h-full bg-[#f8f9fa] min-h-screen">
    <!-- 头部 -->
    <view class="pt-16 pb-8 px-8 bg-white/80 backdrop-blur-xl sticky top-0 z-20 border-b border-black/5">
      <view class="flex items-center justify-between mb-8">
        <view class="flex flex-col gap-2">
          <text class="font-serif text-3xl text-primary font-light tracking-tight">预约座位</text>
          <text class="text-[10px] text-secondary tracking-[0.2em] uppercase font-bold">Select Date & Zone</text>
        </view>
        <view class="w-10 h-10 rounded-full bg-white border border-gray-100 shadow-sm flex items-center justify-center" @tap="goBack">
          <text class="material-symbols-outlined text-gray-500 text-[20px]">close</text>
        </view>
      </view>

      <!-- 日期选择器 -->
      <view class="flex justify-between items-center gap-3 overflow-x-auto hide-scrollbar pb-2">
        <view
          v-for="(date, index) in dates"
          :key="index"
          class="flex flex-col items-center justify-center min-w-[56px] h-[76px] rounded-[22px] transition-all duration-300"
          :class="{
            'bg-primary text-white shadow-[0_8px_20px_rgba(26,26,26,0.25)] translate-y-[-2px]': selectedDate === index,
            'bg-white text-secondary hover:bg-gray-50 shadow-[0_2px_8px_rgba(0,0,0,0.04)] border border-transparent': selectedDate !== index
          }"
          @tap="selectDate(index)"
        >
          <text class="text-[10px] font-medium tracking-wide mb-1 uppercase" :class="selectedDate === index ? 'opacity-80' : 'opacity-40'">{{ date.week }}</text>
          <text class="text-2xl font-display font-bold" :class="selectedDate === index ? 'text-white' : 'text-primary'">{{ date.day }}</text>
        </view>
      </view>
    </view>

    <!-- 区域列表 -->
    <view class="p-6 flex flex-col gap-8 pb-32 overflow-y-auto">
      <view
        v-for="zone in zones"
        :key="zone.id"
        class="group relative bg-white rounded-[32px] overflow-hidden shadow-[0_2px_12px_rgba(0,0,0,0.03)]"
        @tap="goToSeatSelection(zone.id)"
      >
        <!-- 状态标签 -->
        <view class="absolute top-5 right-5 z-10 bg-white/80 backdrop-blur-md px-3 py-1.5 rounded-full text-[10px] font-bold text-primary shadow-lg ring-1 ring-white/50 flex items-center gap-1.5">
          <view class="w-1.5 h-1.5 rounded-full" :class="getOccupancyColor(zone.occupancy)"></view>
          <text>{{ zone.floor }}</text>
        </view>

        <!-- 区域图片 -->
        <view class="h-44 w-full overflow-hidden relative">
          <image
            :src="zone.image"
            mode="aspectFill"
            class="w-full h-full transition-transform duration-1000 high-key-img"
          />
          <view class="absolute inset-0 bg-gradient-to-t from-white via-white/10 to-transparent"></view>
        </view>

        <!-- 区域信息 -->
        <view class="px-8 pb-8 pt-0 flex justify-between items-end relative -mt-4">
          <view class="flex flex-col gap-3">
            <text class="font-serif text-2xl font-medium text-primary bg-white/50 backdrop-blur-sm rounded-lg px-2 -ml-2">{{ zone.name }}</text>
            <view class="flex gap-2">
              <text
                v-for="tag in zone.tags"
                :key="tag"
                class="text-[10px] text-secondary/70 bg-gray-50 border border-gray-100 px-2.5 py-1.5 rounded-lg tracking-wide font-medium"
              >
                {{ tag }}
              </text>
            </view>
          </view>

          <view class="flex flex-col items-end gap-2">
            <text class="text-[9px] text-secondary font-bold uppercase tracking-widest">
              Available <text class="font-display font-bold text-xl text-primary ml-1">{{ zone.available }}</text>
            </text>
            <view class="w-24 h-2 bg-gray-100 rounded-full overflow-hidden p-[2px]">
              <view
                class="h-full rounded-full transition-all duration-1000 ease-out"
                :class="zone.occupancy > 80 ? 'bg-primary' : 'bg-primary/60'"
                :style="{ width: zone.occupancy + '%' }"
              ></view>
            </view>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';

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

const selectedDate = ref<number>(0);
const dates = generateDates();

// 区域数据
const zones = [
  {
    id: 'z1',
    name: '静音研讨区',
    floor: '2F',
    occupancy: 45,
    capacity: 40,
    available: 22,
    tags: ['绝对安静', '独立电源'],
    image: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80&w=800'
  },
  {
    id: 'z2',
    name: '综合阅览区',
    floor: '1F',
    occupancy: 82,
    capacity: 120,
    available: 21,
    tags: ['自然光', '开放式'],
    image: 'https://images.unsplash.com/photo-1524813686514-a57563d77965?auto=format&fit=crop&q=80&w=800'
  },
  {
    id: 'z3',
    name: '协作办公台',
    floor: '3F',
    occupancy: 12,
    capacity: 30,
    available: 26,
    tags: ['可交谈', '白板'],
    image: 'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?auto=format&fit=crop&q=80&w=800'
  }
];

// 选择日期
const selectDate = (index: number) => {
  selectedDate.value = index;
};

// 获取占用率颜色
const getOccupancyColor = (occupancy: number) => {
  if (occupancy > 80) return 'bg-red-500 animate-pulse';
  if (occupancy > 50) return 'bg-yellow-500 animate-pulse';
  return 'bg-green-500 animate-pulse';
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

// 高调图片滤镜
.high-key-img {
  filter: contrast(0.95) brightness(1.05) saturate(0.9);
}

// 隐藏滚动条
.hide-scrollbar::-webkit-scrollbar {
  display: none;
}
.hide-scrollbar {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
</style>
