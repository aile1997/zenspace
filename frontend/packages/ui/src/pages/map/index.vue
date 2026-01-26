<!-- ZenSpace 空间热力分布 -->
<template>
  <view class="flex flex-col h-full bg-[#f8f9fa] min-h-screen overflow-hidden">
    <!-- Header -->
    <view class="pt-14 pb-4 px-6 absolute top-0 w-full z-20 flex justify-between items-center">
      <view class="w-10 h-10 rounded-full bg-white/80 backdrop-blur shadow-sm flex items-center justify-center border border-white" @tap="goBack">
        <text class="material-symbols-outlined text-primary text-[20px]">arrow_back</text>
      </view>
      <text class="font-serif text-lg font-medium text-primary tracking-tight bg-white/80 backdrop-blur px-4 py-1.5 rounded-full shadow-sm border border-white">空间热力分布</text>
      <view class="w-10"></view>
    </view>

    <!-- Map Container -->
    <view class="flex-1 relative overflow-hidden flex items-center justify-center">
      <!-- Grid Background -->
      <view class="absolute inset-0 bg-opacity-60 grid-bg"></view>

      <!-- 1F Floor -->
      <view v-if="activeFloor === '1F'" class="relative w-full h-full p-8 animate-fade-in flex flex-col justify-center">
        <!-- 1F Layout: Open Space - High Heat -->
        <view class="w-full aspect-[4/5] border border-white/60 rounded-[40px] relative bg-white/40 backdrop-blur-md overflow-hidden shadow-glass">
          <HeatHalo level="high" class="top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full" />

          <view class="absolute top-0 left-0 w-full h-24 bg-gradient-to-b from-orange-50/80 to-transparent border-b border-white/20 flex items-center justify-center pt-4">
            <text class="text-orange-800/60 font-serif tracking-[0.2em] text-[10px] uppercase font-bold">Coffee Bar</text>
          </view>

          <view
            class="absolute top-32 bottom-8 left-6 right-6 bg-white/80 border border-white rounded-[32px] shadow-sm flex flex-col items-center justify-center gap-2"
            @tap="goToZone('z2')"
          >
            <view class="w-16 h-16 rounded-full bg-orange-50 flex items-center justify-center mb-2">
              <text class="material-symbols-outlined text-orange-400 text-3xl">local_cafe</text>
            </view>
            <text class="font-serif text-xl text-primary font-medium">综合阅览区</text>
            <view class="flex items-center gap-1.5 px-3 py-1 bg-red-50 rounded-full border border-red-100">
              <view class="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse"></view>
              <text class="text-[10px] text-red-600 font-bold uppercase tracking-wider">High Traffic</text>
            </view>
          </view>
        </view>
      </view>

      <!-- 2F Floor -->
      <view v-else-if="activeFloor === '2F'" class="relative w-full h-full p-6 animate-fade-in flex flex-col justify-center">
        <!-- 2F Layout: Silent Zones - Mixed Heat -->
        <view class="w-full aspect-[3/4] border border-white/60 rounded-[48px] relative bg-white/40 backdrop-blur-md grid grid-cols-2 gap-4 p-4 shadow-glass">
          <!-- Main Zone - Medium Heat -->
          <view
            class="col-span-2 row-span-2 bg-gradient-to-br from-indigo-50/80 to-white/60 border border-white rounded-[36px] flex flex-col items-center justify-center gap-3 relative overflow-hidden"
            @tap="goToZone('z1')"
          >
            <HeatHalo level="med" class="-bottom-10 right-0 w-3/4 h-3/4" />
            <text class="material-symbols-outlined text-indigo-900/20 text-6xl absolute top-4 right-4 rotate-12">volume_off</text>

            <view class="z-10 flex flex-col items-center">
              <text class="font-serif text-2xl text-primary font-medium">静音研讨区</text>
              <text class="text-[10px] text-indigo-400 tracking-widest uppercase mt-1">Silent Zone</text>
            </view>

            <view class="z-10 mt-2 flex items-center gap-1.5">
              <text class="text-xs font-mono font-medium text-primary">45%</text>
              <view class="w-12 h-1 bg-indigo-100 rounded-full overflow-hidden">
                <view class="w-[45%] h-full bg-indigo-500 rounded-full"></view>
              </view>
            </view>
          </view>

          <!-- Sub Zones - Low Heat -->
          <view class="bg-white/60 border border-white rounded-[24px] flex flex-col items-center justify-center gap-1 relative overflow-hidden">
            <HeatHalo level="low" class="w-full h-full opacity-50" />
            <text class="text-xs font-medium text-secondary">Area A</text>
            <text class="text-[10px] text-green-600 bg-green-50 px-1.5 rounded">Avail</text>
          </view>
          <view class="bg-white/60 border border-white rounded-[24px] flex flex-col items-center justify-center gap-1">
            <text class="text-xs font-medium text-secondary">Area B</text>
            <text class="text-[10px] text-gray-400">Locked</text>
          </view>
        </view>
      </view>

      <!-- 3F Floor -->
      <view v-else class="relative w-full h-full p-6 animate-fade-in flex flex-col justify-center">
        <!-- 3F Layout: Co-working - Low Heat -->
        <view class="w-full aspect-[3/4] border border-white/60 rounded-[48px] relative bg-white/40 backdrop-blur-md flex flex-col p-6 gap-6 shadow-glass">
          <view
            class="flex-1 bg-gradient-to-br from-white to-gray-50 border border-white rounded-[36px] shadow-sm flex flex-col items-center justify-center gap-4 relative overflow-hidden"
            @tap="goToZone('z3')"
          >
            <HeatHalo level="low" class="bottom-0 w-full h-1/2" />
            <view class="w-14 h-14 rounded-2xl bg-gray-100 flex items-center justify-center rotate-3">
              <text class="material-symbols-outlined text-gray-500 text-2xl">groups</text>
            </view>
            <view class="text-center">
              <text class="font-serif text-xl text-primary font-medium block">协作办公台</text>
              <text class="text-[10px] text-secondary mt-1 block">Co-working Space</text>
            </view>
          </view>
          <view class="h-28 flex gap-4">
            <view class="flex-1 bg-white/60 border border-white rounded-[24px] flex flex-col items-center justify-center gap-1">
              <text class="material-symbols-outlined text-gray-300">meeting_room</text>
              <text class="text-[9px] text-gray-400 uppercase tracking-wide">Room A</text>
            </view>
            <view class="flex-1 bg-white/60 border border-white rounded-[24px] flex flex-col items-center justify-center gap-1">
              <text class="material-symbols-outlined text-gray-300">meeting_room</text>
              <text class="text-[9px] text-gray-400 uppercase tracking-wide">Room B</text>
            </view>
          </view>
        </view>
      </view>

      <!-- Floor Switcher - Floating Right -->
      <view class="absolute right-6 top-1/2 -translate-y-1/2 flex flex-col gap-4 z-20">
        <view
          v-for="floor in ['3F', '2F', '1F']"
          :key="floor"
          class="w-12 h-12 rounded-2xl flex items-center justify-center text-xs font-serif transition-all duration-300 border backdrop-blur-sm"
          :class="activeFloor === floor
            ? 'bg-primary text-white shadow-xl scale-110 border-transparent'
            : 'bg-white/80 text-secondary border-white shadow-sm'"
          @tap="activeFloor = floor"
        >
          <text class="font-serif">{{ floor }}</text>
        </view>
      </view>

      <!-- Legend - Floating Bottom -->
      <view class="absolute bottom-10 left-1/2 -translate-x-1/2 bg-white/90 backdrop-blur-xl rounded-full px-6 py-3 flex gap-8 shadow-2xl border border-white/50 z-20">
        <view class="flex items-center gap-2">
          <view class="w-2.5 h-2.5 rounded-full bg-green-400 legend-glow"></view>
          <text class="text-[10px] font-medium text-secondary uppercase tracking-wider">Comfort</text>
        </view>
        <view class="flex items-center gap-2">
          <view class="w-2.5 h-2.5 rounded-full bg-yellow-400"></view>
          <text class="text-[10px] font-medium text-secondary uppercase tracking-wider">Moderate</text>
        </view>
        <view class="flex items-center gap-2">
          <view class="w-2.5 h-2.5 rounded-full bg-red-400"></view>
          <text class="text-[10px] font-medium text-secondary uppercase tracking-wider">Busy</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue';

const activeFloor = ref<'1F' | '2F' | '3F'>('2F');

const goToZone = (zoneId: string) => {
  uni.navigateTo({
    url: `/pages/seat/index?zone=${zoneId}`
  });
};

const goBack = () => {
  uni.navigateBack();
};
</script>

<script lang="ts">
// HeatHalo component for heatmap effect
export default {
  components: {
    HeatHalo: {
      props: {
        level: { type: String as () => 'low' | 'med' | 'high', default: 'low' },
        class: { type: String, default: '' }
      },
      template: `
        <view
          class="absolute pointer-events-none inset-0 bg-gradient-radial"
          :class="[colorClass, 'blur-xl', $props.class]"
        />
      `,
      computed: {
        colorClass() {
          const colors = {
            low: 'from-green-400/20 via-green-400/5 to-transparent',
            med: 'from-yellow-400/30 via-yellow-400/10 to-transparent',
            high: 'from-red-500/30 via-red-500/10 to-transparent'
          };
          return colors[this.level as keyof typeof colors];
        }
      }
    }
  }
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

// Grid Background
.grid-bg {
  background-image: radial-gradient(#e5e7eb 1px, transparent 1px);
  background-size: 24px 24px;
}

// Glass shadow
.shadow-glass {
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.08);
}

// Legend glow
.legend-glow {
  box-shadow: 0 0 10px rgba(74, 222, 128, 0.5);
}

// Grid layout
.grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
}

.grid-cols-2 {
  grid-template-columns: repeat(2, 1fr);
}

.col-span-2 {
  grid-column: span 2;
}

.row-span-2 {
  grid-row: span 2;
}

// Animations
@keyframes fade-in {
  from {
    opacity: 0;
    transform: scale(0.95);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

.animate-fade-in {
  animation: fade-in 0.4s ease-out;
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}

.animate-pulse {
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}
</style>
