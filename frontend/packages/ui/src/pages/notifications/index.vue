<!-- ZenSpace 消息中心 -->
<template>
  <view class="flex flex-col h-full bg-gray-50/50 min-h-screen">
    <!-- Header -->
    <view class="pt-14 pb-4 px-6 bg-white/80 backdrop-blur sticky top-0 z-20 border-b border-black/5 flex justify-between items-center">
      <view class="flex items-center gap-4">
        <view class="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center" @tap="goBack">
          <text class="material-symbols-outlined text-gray-500 text-[18px]">arrow_back</text>
        </view>
        <text class="font-serif text-lg font-medium text-primary tracking-tight">消息中心</text>
      </view>
      <view class="text-[11px] text-primary font-medium px-3 py-1 rounded-full bg-white border border-black/5 shadow-sm" @tap="markAllRead">
        全部已读
      </view>
    </view>

    <!-- List -->
    <view class="p-4 flex flex-col gap-3 pb-24 overflow-y-auto">
      <view
        v-for="item in notifications"
        :key="item.id"
        class="p-4 rounded-2xl border border-black/5 flex gap-4 transition-colors"
        :class="item.isRead ? 'bg-gray-50/50' : 'bg-white shadow-sm'"
      >
        <!-- Icon -->
        <view class="w-10 h-10 rounded-full flex-shrink-0 flex items-center justify-center" :class="getColor(item.type)">
          <text class="material-symbols-outlined text-[20px]">{{ getIcon(item.type) }}</text>
        </view>

        <!-- Content -->
        <view class="flex-1 flex flex-col gap-1">
          <view class="flex justify-between items-start">
            <text class="text-sm font-medium" :class="item.isRead ? 'text-secondary' : 'text-primary'">
              {{ item.title }}
            </text>
            <text class="text-[10px] text-gray-400 whitespace-nowrap ml-2">{{ item.time }}</text>
          </view>
          <text class="text-xs text-secondary/80 leading-relaxed line-clamp-2">
            {{ item.message }}
          </text>
        </view>

        <!-- Unread Indicator -->
        <view v-if="!item.isRead" class="w-1.5 h-1.5 rounded-full bg-red-500 mt-2"></view>
      </view>

      <view class="text-center mt-6 mb-4">
        <text class="text-[10px] text-gray-300">仅显示最近 30 天的消息</text>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useToastStore } from '@zenspace/core/stores';

interface NotificationItem {
  id: string;
  type: string;
  title: string;
  message: string;
  time: string;
  isRead: boolean;
}

const toastStore = useToastStore();

const notifications = ref<NotificationItem[]>([
  {
    id: 'n1',
    type: 'booking',
    title: '预约即将开始',
    message: '您预约的 [2F 静音研讨区 A5] 将在 15 分钟后开始，请准时入座。',
    time: '13:45',
    isRead: false,
  },
  {
    id: 'n2',
    type: 'achievement',
    title: '解锁新勋章',
    message: '恭喜！您已达成"社交达人"成就，点击查看详情。',
    time: '10:30',
    isRead: false,
  },
  {
    id: 'n3',
    type: 'system',
    title: '系统维护通知',
    message: '为了提供更好的服务，我们将于明日凌晨 02:00 进行系统升级。',
    time: '昨天',
    isRead: true,
  },
  {
    id: 'n4',
    type: 'promotion',
    title: '限时积分双倍',
    message: '本周末预约任意时段，即可享受积分双倍奖励！',
    time: '昨天',
    isRead: true,
  }
]);

const getIcon = (type: string) => {
  switch(type) {
    case 'booking': return 'event_seat';
    case 'achievement': return 'military_tech';
    case 'promotion': return 'local_offer';
    default: return 'info';
  }
};

const getColor = (type: string) => {
  switch(type) {
    case 'booking': return 'bg-blue-50 text-blue-600';
    case 'achievement': return 'bg-yellow-50 text-yellow-600';
    case 'promotion': return 'bg-red-50 text-red-600';
    default: return 'bg-gray-100 text-gray-500';
  }
};

// 全部已读
const markAllRead = () => {
  notifications.value.forEach(n => n.isRead = true);
  toastStore.showSuccess('已全部标记为已读');
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

// 文本截断
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
