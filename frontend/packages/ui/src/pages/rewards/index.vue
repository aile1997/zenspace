<!-- ZenSpace 积分商城 -->
<template>
  <view class="flex flex-col h-full bg-white min-h-screen">
    <!-- Header - White Minimalist -->
    <view class="pt-14 pb-8 px-6 flex flex-col items-center justify-center text-center relative">
      <!-- History Button -->
      <view class="absolute top-14 right-6">
        <view class="w-9 h-9 rounded-full border border-gray-100 bg-white flex items-center justify-center shadow-sm">
          <text class="material-symbols-outlined text-gray-500 text-[18px]">history</text>
        </view>
      </view>
      <!-- Back Button -->
      <view class="absolute top-14 left-6" @tap="goBack">
        <view class="w-9 h-9 rounded-full border border-gray-100 bg-white flex items-center justify-center shadow-sm">
          <text class="material-symbols-outlined text-gray-500 text-[18px]">arrow_back</text>
        </view>
      </view>

      <!-- Points Display -->
      <view class="mt-8 flex flex-col items-center gap-2">
        <text class="text-[10px] tracking-[0.2em] text-accent uppercase font-medium">Current Balance</text>
        <view class="flex items-baseline gap-1">
          <text class="font-serif text-[42px] font-medium text-primary tracking-tight leading-tight">{{ userPoints.toLocaleString() }}</text>
          <text class="text-sm text-secondary font-serif pb-1">积分</text>
        </view>
        <view class="h-[1px] w-8 bg-gray-200 mt-4"></view>
      </view>
    </view>

    <!-- Main Content -->
    <view class="flex-1 px-6 flex flex-col gap-10 pb-32 overflow-y-auto hide-scrollbar">
      <!-- Redeem Section -->
      <view class="flex flex-col gap-5">
        <view class="flex items-center justify-between">
          <text class="font-serif text-lg font-medium text-primary tracking-tight">积分兑换</text>
          <text class="text-[11px] text-accent tracking-wider">查看全部</text>
        </view>

        <view class="grid grid-cols-2 gap-4">
          <view
            v-for="item in rewards"
            :key="item.id"
            class="group relative flex flex-col rounded-xl border border-gray-100 bg-white overflow-hidden transition-all duration-500 hover:shadow-lg cursor-pointer hover:-translate-y-1"
            @tap="handleRedeem(item)"
          >
            <!-- Image -->
            <view class="relative w-full aspect-[4/3] overflow-hidden bg-gray-50">
              <image
                :src="item.image"
                mode="aspectFill"
                class="w-full h-full high-key-img transition-transform duration-700 group-hover:scale-105"
              />
              <view class="absolute top-2 right-2 bg-white/90 backdrop-blur px-2 py-0.5 rounded text-[10px] font-medium text-primary border border-gray-100 shadow-sm">
                {{ item.points }} 积分
              </view>
            </view>
            <!-- Info -->
            <view class="p-3 flex flex-col gap-1">
              <text class="text-sm font-medium text-primary tracking-tight group-hover:text-black transition-colors">{{ item.title }}</text>
              <text class="text-[10px] text-secondary/70 line-clamp-1">{{ item.description }}</text>
            </view>
          </view>
        </view>
      </view>

      <!-- Earn Section -->
      <view class="flex flex-col gap-5">
        <view class="flex items-center justify-between">
          <text class="font-serif text-lg font-medium text-primary tracking-tight">赚取积分</text>
        </view>

        <view class="flex flex-col gap-3">
          <!-- Daily Check-in -->
          <view class="flex items-center justify-between p-4 rounded-xl border border-gray-100 bg-white shadow-sm">
            <view class="flex items-center gap-4">
              <view class="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center border border-gray-100 text-gray-400">
                <text class="material-symbols-outlined text-[20px] icon-light">check_circle</text>
              </view>
              <view class="flex flex-col gap-0.5">
                <text class="text-sm font-medium text-primary">每日签到</text>
                <text class="text-[10px] text-secondary/60">连续签到奖励翻倍</text>
              </view>
            </view>
            <view class="px-4 py-1.5 rounded-full bg-primary text-white text-[10px] font-medium tracking-wide shadow-md">
              +10 积分
            </view>
          </view>

          <!-- Focus 4h -->
          <view class="flex items-center justify-between p-4 rounded-xl border border-gray-100 bg-white shadow-sm">
            <view class="flex items-center gap-4">
              <view class="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center border border-gray-100 text-gray-400">
                <text class="material-symbols-outlined text-[20px] icon-light">hourglass_top</text>
              </view>
              <view class="flex flex-col gap-0.5">
                <text class="text-sm font-medium text-primary">完成 4h 专注</text>
                <text class="text-[10px] text-secondary/60">不间断学习挑战</text>
              </view>
            </view>
            <view class="px-4 py-1.5 rounded-full border border-gray-200 text-primary text-[10px] font-medium tracking-wide">
              去完成
            </view>
          </view>

          <!-- Share -->
          <view class="flex items-center justify-between p-4 rounded-xl border border-gray-100 bg-white shadow-sm">
            <view class="flex items-center gap-4">
              <view class="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center border border-gray-100 text-gray-400">
                <text class="material-symbols-outlined text-[20px] icon-light">edit_note</text>
              </view>
              <view class="flex flex-col gap-0.5">
                <text class="text-sm font-medium text-primary">分享自习心得</text>
                <text class="text-[10px] text-secondary/60">发布至社区广场</text>
              </view>
            </view>
            <view class="px-4 py-1.5 rounded-full border border-gray-200 text-primary text-[10px] font-medium tracking-wide">
              去完成
            </view>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useUserStore } from '@zenspace/core/stores';
import { useToastStore } from '@zenspace/core/stores';

interface RewardItem {
  id: string;
  title: string;
  description: string;
  points: number;
  category: string;
  image: string;
}

const userStore = useUserStore();
const toastStore = useToastStore();

const userPoints = computed(() => userStore.user?.points || 0);

const rewards: RewardItem[] = [
  {
    id: 'r1',
    title: '手冲咖啡体验券',
    description: '甄选瑰夏豆，现磨现冲',
    points: 500,
    category: 'food',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuA6RPAH2LO62Xy4yBusGHH4ER71zocYJV9sJhGzOvlw0-r4pEp3fFu1rZ9Ij7az35xeLYMWqzCMWAX4dK4-kzYtg1E6F2g9NrYdj_N_PpKsvI8s2G0PuWg0GtkCRRL0k9SVxlMhMmDdrshxBZPQkCod8f6kKKhQrj5l5ZpK1rL7Ax_zBVf0vi5szIlWSW2j9ARmkGvbfQvrg3L2YcfYlKFn2sd7QHQJLIxrKPDB88O4IKFMN6972S_s0diZKbxyhdSmGtsB9TQA4pRC'
  },
  {
    id: 'r2',
    title: '定制金属书签',
    description: '静谧阅读时光伴侣',
    points: 300,
    category: 'merch',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBwh0fChKT5iCOKNK3imA3XqqXDL5LrQGt0sl12EWraOL-wiVG7jDcEZt9zUiERE6X-aDGNGSvGJyO5oqkz_0f3HeR5KsCKQikCNieL28ljc2DL9XrD48evjSpHzAIX8dyLoOxmHPShSB8GPMf-YLymbV17SdkMYikCJGULoNw9UW_AhcFSRHM8qsUstEerMPWT_xIpLDUnrQ59hS0TdiMycmmp9PjRaw_R_cedVgKUKzcjMnyyvbwLyWuEX6lZBIY9KFXdJwmzXFFP'
  },
  {
    id: 'r3',
    title: '专注时刻兑换券',
    description: 'VIP 研修室 1 小时',
    points: 100,
    category: 'service',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAjxJgGmU-iDdvXbXRaGr9jGXwO5IOh4Czo2hU5vZgFMmWqqbW08fIoeLePRwF6HlYNgQC1FcPRlxl3bB46aWGD88-jO-M_m5cx1Eyoylp8xO4RFhWwQv5RjbE7AH0oRKyuONYJ4pCprBhflKLLTcL986GwCJKsSVNi8i7UxYP51ZigFmaeHP8Kqw-d4E5_SaY0xcrzldTWhcNxWLy2Vc0gGBhag6D6KurNixRgAUa28kFdHJ73Wgak3S5xQgjrN35Tdn5Ez6GyB3If'
  },
  {
    id: 'r4',
    title: 'MOJI 笔记本',
    description: 'A5 点阵，书写流畅',
    points: 800,
    category: 'merch',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuB2pPVrk9uttou5aGw_G6QYUDt_s5Fa_IqIpkheucJ5olWjCKIoMxfmgbfc1Ah5rzf57zzr4SzAZsbSaDvytxLusYo5TtqEErXlk4zIqqtXW9G38yvoZDdfPfj3xHysPiGAmHJ-eYhpD_xCvoiHFqcw0aJRVZ5U047SjmFOnoZcW6KjWenqAbMCbWqfge2OPWCRN74HUly_WZ7Pt9G-ryKXcL9PPc_yX2LrXgGntjkzwVmH2-lmvxO1Q5_wbcRchchesOfRICU89FyT'
  }
];

// 兑换奖励
const handleRedeem = (item: RewardItem) => {
  uni.showModal({
    title: '确认兑换',
    content: `确定消耗 ${item.points} 积分兑换"${item.title}"吗？`,
    success: (res) => {
      if (res.confirm && userStore.user) {
        // 扣除积分
        userStore.user.points -= item.points;
        toastStore.showSuccess(`兑换成功！${item.title} 已放入卡包`);
      }
    }
  });
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
