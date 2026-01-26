# Ticket-004: 前端 UI 完善与浏览器端完整呈现

> **工票类型**: Frontend Development
> **优先级**: ⭐⭐⭐ P0 (高优先级)
> **预估工作量**: 3-4 天
> **分配给**: Builder (前端)
> **状态**: 📋 待开始
> **创建日期**: 2026-01-24
> **依赖**: Core 层 Composables ✅

---

## 1. 任务背景

### 用户需求

**首要目标**: 先把前端界面全部保质保量迁移完，让产品经理/用户能在浏览器端看到完整的效果。

**后续目标**: 等后端开发完成后，再统一接入真实数据。

### 当前状态

**已完成**:
- ✅ Core 层逻辑完整（Composables、Stores、Tests）
- ✅ 5 个页面基础结构搭建
- ✅ 登录页 95% 完成

**待完善**:
- ⚠️ 部分页面 UI 不完整（使用简单的文本展示）
- ⚠️ 缺少关键 UI 组件（座位网格、预约卡片、统计图表等）
- ⚠️ 交互动效不完整
- ⚠️ H5 端浏览器兼容性未验证

---

## 2. 任务目标

### 核心目标

打造一个**视觉完整、交互流畅、可在浏览器完美展示**的前端 Demo，即使使用模拟数据也能完整呈现产品功能和用户体验。

### 具体目标

- [ ] 完善所有页面的 UI 组件和布局
- [ ] 实现所有交互动效（点击、滑动、动画）
- [ ] 确保在浏览器 H5 端完美展示
- [ ] 使用精心设计的模拟数据展示真实场景
- [ ] 添加完整的页面间导航
- [ ] 优化视觉设计和用户体验

---

## 3. 详细任务清单

### 🏠 任务 1: 首页 UI 完善 (P0)

#### 当前状态

```vue
<!-- 当前：简单的文本展示 -->
<view class="stats-grid">
  <text class="stat-value">82%</text>
  <text class="stat-value">45%</text>
  <text class="stat-value">12%</text>
</view>
```

#### 目标效果

**需要实现的组件**:

1. **顶部导航栏**
   - ZenSpace Logo
   - 用户头像 + 欢迎语
   - 消息通知图标（带红点提示）

2. **今日数据卡片**
   - Glassmorphism 风格卡片
   - 动态数字滚动动画
   - 图标 + 数据 + 趋势箭头
   - 实时更新效果（模拟）

3. **区域列表 - 卡片式布局**
   - 区域封面图片（渐变背景 + 图标）
   - 区域名称 + 标签（静音、协作、窗边）
   - 价格信息 + VIP 优惠标识
   - 拥挤度进度条（颜色渐变：绿→黄→红）
   - 可用座位数 / 总座位数
   - 点击卡片的波纹动效

4. **快速操作区**
   - 我的预约（快捷入口）
   - 积分商城（快捷入口）
   - 学习统计（快捷入口）
   - 浮动按钮样式

#### 详细实现代码

```vue
<template>
  <view class="home-page">
    <!-- 顶部导航 -->
    <view class="header">
      <view class="header-left">
        <image src="/static/logo.png" class="logo" />
        <text class="brand-name">ZenSpace</text>
      </view>
      <view class="header-right">
        <view class="notification-icon" @click="goToNotifications">
          <text class="icon">🔔</text>
          <view v-if="hasUnread" class="red-dot"></view>
        </view>
        <image :src="userAvatar" class="user-avatar" @click="goToProfile" />
      </view>
    </view>

    <!-- 欢迎语 -->
    <view class="welcome-section">
      <text class="greeting">{{ greeting }}</text>
      <text class="username">{{ username }}</text>
    </view>

    <!-- 今日数据卡片 -->
    <view class="stats-card glass-card">
      <view class="card-header">
        <text class="card-title">📊 今日数据</text>
        <text class="update-time">刚刚更新</text>
      </view>
      <view class="stats-grid">
        <view
          v-for="stat in todayStats"
          :key="stat.label"
          class="stat-item"
        >
          <text class="stat-icon">{{ stat.icon }}</text>
          <view class="stat-content">
            <text class="stat-value">
              <animated-number :value="stat.value" />
              <span class="stat-unit">{{ stat.unit }}</span>
            </text>
            <text class="stat-label">{{ stat.label }}</text>
          </view>
          <view :class="['trend-badge', stat.trend]">
            <text>{{ stat.trendText }}</text>
          </view>
        </view>
      </view>
    </view>

    <!-- 区域列表 -->
    <view class="zones-section">
      <view class="section-header">
        <text class="section-title">🏢 选择区域</text>
        <text class="section-more" @click="goToAllZones">查看全部 ›</text>
      </view>

      <scroll-view scroll-y class="zones-scroll">
        <view
          v-for="zone in zones"
          :key="zone.id"
          class="zone-card"
          @click="selectZone(zone)"
        >
          <!-- 卡片背景渐变 -->
          <view
            class="zone-bg"
            :style="{ background: zone.gradient }"
          ></view>

          <!-- 卡片内容 -->
          <view class="zone-content">
            <!-- 顶部信息 -->
            <view class="zone-header">
              <view class="zone-title-row">
                <text class="zone-icon">{{ zone.icon }}</text>
                <text class="zone-name">{{ zone.name }}</text>
              </view>
              <view class="zone-tags">
                <text
                  v-for="tag in zone.tags"
                  :key="tag"
                  class="zone-tag"
                >
                  {{ tag }}
                </text>
              </view>
            </view>

            <!-- 价格信息 -->
            <view class="zone-pricing">
              <view class="price-main">
                <text class="price-symbol">¥</text>
                <text class="price-value">{{ zone.hourlyPrice }}</text>
                <text class="price-unit">/小时</text>
              </view>
              <view v-if="isVIP" class="vip-price">
                <text class="vip-label">VIP</text>
                <text class="vip-value">¥{{ zone.vipPrice }}</text>
              </view>
            </view>

            <!-- 座位信息 -->
            <view class="zone-capacity">
              <view class="capacity-bar-wrapper">
                <view class="capacity-label">
                  <text>可用座位</text>
                  <text class="capacity-number">
                    {{ zone.availableSeats }} / {{ zone.capacity }}
                  </text>
                </view>
                <view class="capacity-bar">
                  <view
                    class="capacity-fill"
                    :class="getCrowdLevelClass(zone.crowdLevel)"
                    :style="{ width: zone.crowdLevel + '%' }"
                  ></view>
                </view>
              </view>
              <text
                :class="['crowd-status', getCrowdLevelClass(zone.crowdLevel)]"
              >
                {{ getCrowdText(zone.crowdLevel) }}
              </text>
            </view>
          </view>

          <!-- 点击波纹效果 -->
          <view class="ripple-effect"></view>
        </view>
      </scroll-view>
    </view>

    <!-- 快速操作 -->
    <view class="quick-actions">
      <view
        v-for="action in quickActions"
        :key="action.id"
        class="action-btn"
        @click="action.handler"
      >
        <view class="action-icon-wrapper">
          <text class="action-icon">{{ action.icon }}</text>
          <view v-if="action.badge" class="action-badge">
            {{ action.badge }}
          </view>
        </view>
        <text class="action-label">{{ action.label }}</text>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

// 模拟数据
const username = ref('小明')
const userAvatar = ref('/static/avatar.png')
const hasUnread = ref(true)
const isVIP = ref(false)

// 计算问候语
const greeting = computed(() => {
  const hour = new Date().getHours()
  if (hour < 6) return '夜深了'
  if (hour < 9) return '早上好'
  if (hour < 12) return '上午好'
  if (hour < 14) return '中午好'
  if (hour < 18) return '下午好'
  return '晚上好'
})

// 今日数据
const todayStats = ref([
  {
    icon: '🪑',
    label: '总座位',
    value: 156,
    unit: '个',
    trend: 'stable',
    trendText: '持平'
  },
  {
    icon: '✅',
    label: '已预约',
    value: 128,
    unit: '个',
    trend: 'up',
    trendText: '↑ 12%'
  },
  {
    icon: '🔓',
    label: '可用',
    value: 28,
    unit: '个',
    trend: 'down',
    trendText: '↓ 8%'
  }
])

// 区域数据（精心设计的模拟数据）
const zones = ref([
  {
    id: 'zone-1',
    name: '静音研讨区',
    icon: '🤫',
    tags: ['绝对安静', '独立电源', '窗边'],
    hourlyPrice: 15,
    vipPrice: 12,
    capacity: 48,
    availableSeats: 12,
    crowdLevel: 75,
    gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
  },
  {
    id: 'zone-2',
    name: '协作办公区',
    icon: '👥',
    tags: ['可讨论', '大桌面', '投影仪'],
    hourlyPrice: 12,
    vipPrice: 10,
    capacity: 32,
    availableSeats: 18,
    crowdLevel: 44,
    gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)'
  },
  {
    id: 'zone-3',
    name: '窗边休闲区',
    icon: '🪟',
    tags: ['采光好', '舒适沙发', '咖啡吧'],
    hourlyPrice: 18,
    vipPrice: 15,
    capacity: 24,
    availableSeats: 8,
    crowdLevel: 67,
    gradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)'
  },
  {
    id: 'zone-4',
    name: '深夜专区',
    icon: '🌙',
    tags: ['24小时', '安静', '咖啡无限'],
    hourlyPrice: 20,
    vipPrice: 16,
    capacity: 16,
    availableSeats: 14,
    crowdLevel: 12,
    gradient: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)'
  }
])

// 快速操作
const quickActions = ref([
  {
    id: 'my-bookings',
    icon: '📋',
    label: '我的预约',
    badge: 2,
    handler: () => uni.switchTab({ url: '/pages/my-appointments/index' })
  },
  {
    id: 'points-mall',
    icon: '🎁',
    label: '积分商城',
    badge: null,
    handler: () => uni.navigateTo({ url: '/pages/points-mall/index' })
  },
  {
    id: 'stats',
    icon: '📊',
    label: '学习统计',
    badge: null,
    handler: () => uni.navigateTo({ url: '/pages/study-stats/index' })
  }
])

// 方法
const getCrowdLevelClass = (level: number) => {
  if (level >= 80) return 'crowd-high'
  if (level >= 50) return 'crowd-medium'
  return 'crowd-low'
}

const getCrowdText = (level: number) => {
  if (level >= 80) return '🔥 拥挤'
  if (level >= 50) return '😊 适中'
  return '✨ 空闲'
}

const selectZone = (zone: any) => {
  uni.navigateTo({
    url: `/pages/seat/index?zoneId=${zone.id}&zoneName=${zone.name}`
  })
}

const goToNotifications = () => {
  uni.navigateTo({ url: '/pages/notifications/index' })
}

const goToProfile = () => {
  uni.switchTab({ url: '/pages/profile/index' })
}

const goToAllZones = () => {
  uni.navigateTo({ url: '/pages/all-zones/index' })
}
</script>

<style scoped lang="scss">
.home-page {
  min-height: 100vh;
  background: linear-gradient(180deg, #f8f9ff 0%, #fff 100%);
  padding-bottom: 120rpx;
}

/* 顶部导航 */
.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 40rpx 30rpx 20rpx;
  background: white;
  box-shadow: 0 2rpx 20rpx rgba(0, 0, 0, 0.03);
}

.header-left {
  display: flex;
  align-items: center;
  gap: 16rpx;
}

.logo {
  width: 60rpx;
  height: 60rpx;
  border-radius: 12rpx;
}

.brand-name {
  font-size: 36rpx;
  font-weight: 700;
  background: linear-gradient(135deg, #667eea, #764ba2);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 24rpx;
}

.notification-icon {
  position: relative;
  width: 60rpx;
  height: 60rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f5f7fa;
  border-radius: 50%;
}

.icon {
  font-size: 36rpx;
}

.red-dot {
  position: absolute;
  top: 8rpx;
  right: 8rpx;
  width: 16rpx;
  height: 16rpx;
  background: #ff4757;
  border-radius: 50%;
  border: 3rpx solid white;
}

.user-avatar {
  width: 60rpx;
  height: 60rpx;
  border-radius: 50%;
  border: 3rpx solid #667eea;
}

/* 欢迎语 */
.welcome-section {
  padding: 30rpx;
  display: flex;
  align-items: baseline;
  gap: 12rpx;
}

.greeting {
  font-size: 48rpx;
  font-weight: 700;
  color: #2d3748;
}

.username {
  font-size: 32rpx;
  color: #667eea;
  font-weight: 600;
}

/* Glassmorphism 卡片 */
.glass-card {
  background: rgba(255, 255, 255, 0.7);
  backdrop-filter: blur(20rpx);
  border-radius: 24rpx;
  border: 2rpx solid rgba(255, 255, 255, 0.3);
  box-shadow: 0 16rpx 60rpx rgba(102, 126, 234, 0.1);
}

/* 今日数据卡片 */
.stats-card {
  margin: 30rpx;
  padding: 40rpx;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30rpx;
}

.card-title {
  font-size: 32rpx;
  font-weight: 700;
  color: #2d3748;
}

.update-time {
  font-size: 24rpx;
  color: #a0aec0;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 24rpx;
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12rpx;
  padding: 24rpx;
  background: white;
  border-radius: 16rpx;
  box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.03);
}

.stat-icon {
  font-size: 48rpx;
}

.stat-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6rpx;
}

.stat-value {
  font-size: 36rpx;
  font-weight: 700;
  color: #2d3748;
}

.stat-unit {
  font-size: 20rpx;
  color: #a0aec0;
  margin-left: 4rpx;
}

.stat-label {
  font-size: 24rpx;
  color: #718096;
}

.trend-badge {
  padding: 6rpx 12rpx;
  border-radius: 8rpx;
  font-size: 20rpx;
  font-weight: 600;

  &.up {
    background: #d4f4dd;
    color: #22c55e;
  }

  &.down {
    background: #fee;
    color: #ef4444;
  }

  &.stable {
    background: #e5e7eb;
    color: #6b7280;
  }
}

/* 区域列表 */
.zones-section {
  padding: 0 30rpx;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24rpx;
}

.section-title {
  font-size: 32rpx;
  font-weight: 700;
  color: #2d3748;
}

.section-more {
  font-size: 26rpx;
  color: #667eea;
}

.zones-scroll {
  max-height: 800rpx;
}

.zone-card {
  position: relative;
  margin-bottom: 24rpx;
  border-radius: 24rpx;
  overflow: hidden;
  box-shadow: 0 8rpx 40rpx rgba(0, 0, 0, 0.08);
  transition: transform 0.3s;
}

.zone-card:active {
  transform: scale(0.98);
}

.zone-bg {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  opacity: 0.9;
}

.zone-content {
  position: relative;
  padding: 32rpx;
  color: white;
}

.zone-header {
  margin-bottom: 24rpx;
}

.zone-title-row {
  display: flex;
  align-items: center;
  gap: 12rpx;
  margin-bottom: 12rpx;
}

.zone-icon {
  font-size: 40rpx;
}

.zone-name {
  font-size: 32rpx;
  font-weight: 700;
}

.zone-tags {
  display: flex;
  gap: 12rpx;
}

.zone-tag {
  padding: 6rpx 16rpx;
  background: rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(10rpx);
  border-radius: 24rpx;
  font-size: 22rpx;
}

.zone-pricing {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24rpx;
}

.price-main {
  display: flex;
  align-items: baseline;
  gap: 4rpx;
}

.price-symbol {
  font-size: 28rpx;
  font-weight: 600;
}

.price-value {
  font-size: 44rpx;
  font-weight: 700;
}

.price-unit {
  font-size: 24rpx;
  opacity: 0.9;
}

.vip-price {
  display: flex;
  align-items: center;
  gap: 8rpx;
  padding: 8rpx 16rpx;
  background: rgba(255, 215, 0, 0.3);
  backdrop-filter: blur(10rpx);
  border-radius: 24rpx;
}

.vip-label {
  font-size: 20rpx;
  font-weight: 700;
  color: #ffd700;
}

.vip-value {
  font-size: 26rpx;
  font-weight: 700;
}

.zone-capacity {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.capacity-bar-wrapper {
  flex: 1;
  margin-right: 24rpx;
}

.capacity-label {
  display: flex;
  justify-content: space-between;
  margin-bottom: 12rpx;
  font-size: 24rpx;
  opacity: 0.9;
}

.capacity-number {
  font-weight: 600;
}

.capacity-bar {
  height: 8rpx;
  background: rgba(255, 255, 255, 0.3);
  border-radius: 8rpx;
  overflow: hidden;
}

.capacity-fill {
  height: 100%;
  border-radius: 8rpx;
  transition: width 0.5s ease;

  &.crowd-low {
    background: #22c55e;
  }

  &.crowd-medium {
    background: #f59e0b;
  }

  &.crowd-high {
    background: #ef4444;
  }
}

.crowd-status {
  padding: 8rpx 16rpx;
  background: rgba(255, 255, 255, 0.3);
  backdrop-filter: blur(10rpx);
  border-radius: 24rpx;
  font-size: 22rpx;
  font-weight: 600;
  white-space: nowrap;
}

/* 快速操作 */
.quick-actions {
  position: fixed;
  bottom: 120rpx;
  right: 30rpx;
  display: flex;
  flex-direction: column;
  gap: 20rpx;
}

.action-btn {
  display: flex;
  align-items: center;
  gap: 16rpx;
  padding: 16rpx 24rpx;
  background: white;
  border-radius: 100rpx;
  box-shadow: 0 8rpx 30rpx rgba(102, 126, 234, 0.15);
  transition: transform 0.2s;
}

.action-btn:active {
  transform: scale(0.95);
}

.action-icon-wrapper {
  position: relative;
  width: 50rpx;
  height: 50rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea, #764ba2);
  border-radius: 50%;
}

.action-icon {
  font-size: 32rpx;
}

.action-badge {
  position: absolute;
  top: -6rpx;
  right: -6rpx;
  min-width: 32rpx;
  height: 32rpx;
  padding: 0 8rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #ff4757;
  color: white;
  font-size: 20rpx;
  font-weight: 700;
  border-radius: 16rpx;
  border: 3rpx solid white;
}

.action-label {
  font-size: 26rpx;
  font-weight: 600;
  color: #2d3748;
}
</style>
```

**验收标准**:
- [ ] 顶部导航栏完整（Logo、用户头像、通知图标）
- [ ] 欢迎语根据时间动态显示
- [ ] 今日数据卡片使用 Glassmorphism 风格
- [ ] 数字有滚动动画效果
- [ ] 区域卡片有渐变背景
- [ ] 拥挤度进度条颜色根据占用率变化
- [ ] 点击卡片有视觉反馈
- [ ] 快速操作浮动按钮可点击

---

### 🪑 任务 2: 选座页 - 座位网格组件 (P0)

#### 目标效果

实现一个**可视化的座位网格**，类似电影院选座：
- 座位图标根据状态变色（可用/已占/已选）
- 点击座位有动画反馈
- 座位类型标识（窗边、标准、卡座）
- 支持缩放和拖拽（可选）

#### 详细实现代码

```vue
<template>
  <view class="seat-page">
    <!-- 顶部信息 -->
    <view class="page-header glass-card">
      <view class="zone-info">
        <text class="zone-icon">{{ zoneIcon }}</text>
        <view class="zone-detail">
          <text class="zone-name">{{ zoneName }}</text>
          <text class="zone-date">{{ selectedDate }} {{ selectedTime }}</text>
        </view>
      </view>
      <view class="seat-stats">
        <view class="stat-item">
          <text class="stat-dot available"></text>
          <text class="stat-text">可用 {{ availableCount }}</text>
        </view>
        <view class="stat-item">
          <text class="stat-dot occupied"></text>
          <text class="stat-text">已占 {{ occupiedCount }}</text>
        </view>
        <view class="stat-item">
          <text class="stat-dot selected"></text>
          <text class="stat-text">已选 {{ selectedCount }}</text>
        </view>
      </view>
    </view>

    <!-- 日期时段选择器 -->
    <view class="datetime-selector glass-card">
      <view class="selector-item" @click="showDatePicker = true">
        <text class="selector-label">📅 日期</text>
        <text class="selector-value">{{ selectedDate }}</text>
        <text class="selector-arrow">›</text>
      </view>
      <view class="selector-item">
        <text class="selector-label">⏰ 时段</text>
        <view class="time-slots">
          <text
            v-for="slot in timeSlots"
            :key="slot.value"
            :class="['time-slot', { active: selectedTime === slot.value }]"
            @click="selectedTime = slot.value"
          >
            {{ slot.label }}
          </text>
        </view>
      </view>
    </view>

    <!-- 座位网格 -->
    <view class="seats-container">
      <view class="seats-header">
        <text class="seats-title">🎬 选择座位</text>
        <text class="seats-tip">点击座位进行选择</text>
      </view>

      <!-- 舞台/屏幕指示 -->
      <view class="stage-indicator">
        <text>📺 屏幕方向</text>
      </view>

      <!-- 座位网格 -->
      <scroll-view scroll-y scroll-x class="seats-scroll">
        <view class="seats-grid">
          <!-- 行标签 A, B, C... -->
          <view class="row-labels">
            <text
              v-for="(row, index) in rows"
              :key="row"
              class="row-label"
            >
              {{ row }}
            </text>
          </view>

          <!-- 座位矩阵 -->
          <view class="seats-matrix">
            <view
              v-for="row in rows"
              :key="row"
              class="seat-row"
            >
              <view
                v-for="col in cols"
                :key="`${row}-${col}`"
                :class="[
                  'seat',
                  `seat-${getSeat(row, col)?.status.toLowerCase()}`,
                  {
                    'seat-selected': isSelected(row, col),
                    'seat-window': getSeat(row, col)?.type === 'WINDOW',
                    'seat-booth': getSeat(row, col)?.type === 'BOOTH'
                  }
                ]"
                @click="handleSeatClick(row, col)"
              >
                <!-- 座位图标 -->
                <text class="seat-icon">
                  {{ getSeatIcon(row, col) }}
                </text>
                <!-- 座位编号 -->
                <text class="seat-label">
                  {{ row }}{{ col }}
                </text>
              </view>
            </view>
          </view>
        </view>
      </scroll-view>

      <!-- 图例说明 -->
      <view class="legend">
        <view class="legend-item">
          <view class="legend-icon window">🪟</view>
          <text>窗边座位</text>
        </view>
        <view class="legend-item">
          <view class="legend-icon booth">🛋️</view>
          <text>卡座</text>
        </view>
        <view class="legend-item">
          <view class="legend-icon standard">🪑</view>
          <text>标准座位</text>
        </view>
      </view>
    </view>

    <!-- 底部确认栏 -->
    <view v-if="selectedSeats.length > 0" class="bottom-bar glass-card">
      <view class="selected-info">
        <text class="selected-count">已选 {{ selectedSeats.length }} 个座位</text>
        <text class="selected-list">
          {{ selectedSeats.map(s => s.label).join(', ') }}
        </text>
      </view>
      <button class="confirm-btn" @click="confirmBooking">
        确认预约 ¥{{ totalPrice }}
      </button>
    </view>

    <!-- 日期选择器弹窗 -->
    <picker
      v-if="showDatePicker"
      mode="date"
      :value="selectedDate"
      :start="minDate"
      :end="maxDate"
      @change="onDateChange"
      @cancel="showDatePicker = false"
    >
      <view></view>
    </picker>
  </view>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import type { Seat } from '@zenspace/core/types'

// Props
const props = defineProps<{
  zoneId?: string
  zoneName?: string
}>()

// 状态
const selectedDate = ref('2026-01-25')
const selectedTime = ref('morning')
const selectedSeats = ref<Seat[]>([])
const showDatePicker = ref(false)

// 时段配置
const timeSlots = [
  { label: '上午', value: 'morning', time: '09:00-12:00' },
  { label: '下午', value: 'afternoon', time: '13:00-17:00' },
  { label: '晚上', value: 'evening', time: '18:00-22:00' }
]

// 座位数据（8 行 x 6 列）
const rows = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H']
const cols = [1, 2, 3, 4, 5, 6]

// 模拟座位数据
const seats = ref<Seat[]>([
  // A 排 - 窗边座位
  { id: 'A1', label: 'A-01', row: 'A', col: 1, type: 'WINDOW', status: 'AVAILABLE' },
  { id: 'A2', label: 'A-02', row: 'A', col: 2, type: 'WINDOW', status: 'OCCUPIED' },
  { id: 'A3', label: 'A-03', row: 'A', col: 3, type: 'WINDOW', status: 'AVAILABLE' },
  { id: 'A4', label: 'A-04', row: 'A', col: 4, type: 'WINDOW', status: 'AVAILABLE' },
  { id: 'A5', label: 'A-05', row: 'A', col: 5, type: 'WINDOW', status: 'OCCUPIED' },
  { id: 'A6', label: 'A-06', row: 'A', col: 6, type: 'WINDOW', status: 'AVAILABLE' },

  // B-H 排 - 标准座位 + 部分卡座
  // ... 省略其他座位，实际应该有 48 个座位
])

// 计算属性
const availableCount = computed(() => {
  return seats.value.filter(s => s.status === 'AVAILABLE').length
})

const occupiedCount = computed(() => {
  return seats.value.filter(s => s.status === 'OCCUPIED').length
})

const selectedCount = computed(() => selectedSeats.value.length)

const totalPrice = computed(() => {
  const hours = 3 // 根据时段计算
  const pricePerHour = 15
  return selectedSeats.value.length * hours * pricePerHour
})

const minDate = computed(() => {
  const today = new Date()
  return today.toISOString().split('T')[0]
})

const maxDate = computed(() => {
  const future = new Date()
  future.setDate(future.getDate() + 7)
  return future.toISOString().split('T')[0]
})

const zoneIcon = computed(() => {
  return '🤫' // 根据 zoneId 返回不同图标
})

// 方法
const getSeat = (row: string, col: number) => {
  return seats.value.find(s => s.row === row && s.col === col)
}

const getSeatIcon = (row: string, col: number) => {
  const seat = getSeat(row, col)
  if (!seat) return '❌'

  if (seat.type === 'WINDOW') return '🪟'
  if (seat.type === 'BOOTH') return '🛋️'
  return '🪑'
}

const isSelected = (row: string, col: number) => {
  const seat = getSeat(row, col)
  return seat && selectedSeats.value.some(s => s.id === seat.id)
}

const handleSeatClick = (row: string, col: number) => {
  const seat = getSeat(row, col)
  if (!seat) return

  if (seat.status !== 'AVAILABLE') {
    uni.showToast({
      title: '该座位不可用',
      icon: 'none'
    })
    return
  }

  const index = selectedSeats.value.findIndex(s => s.id === seat.id)
  if (index > -1) {
    // 取消选择
    selectedSeats.value.splice(index, 1)
  } else {
    // 添加选择
    selectedSeats.value.push(seat)
  }

  // 震动反馈
  uni.vibrateShort({ type: 'light' })
}

const confirmBooking = () => {
  if (selectedSeats.value.length === 0) return

  uni.showModal({
    title: '确认预约',
    content: `预约 ${selectedSeats.value.length} 个座位，共 ¥${totalPrice.value}`,
    success: (res) => {
      if (res.confirm) {
        // 跳转到支付
        uni.showToast({
          title: '预约成功',
          icon: 'success'
        })
        setTimeout(() => {
          uni.switchTab({ url: '/pages/my-appointments/index' })
        }, 1500)
      }
    }
  })
}

const onDateChange = (e: any) => {
  selectedDate.value = e.detail.value
  showDatePicker.value = false
}
</script>

<style scoped lang="scss">
.seat-page {
  min-height: 100vh;
  background: linear-gradient(180deg, #f8f9ff 0%, #fff 100%);
  padding-bottom: 200rpx;
}

/* Glassmorphism 卡片 */
.glass-card {
  background: rgba(255, 255, 255, 0.7);
  backdrop-filter: blur(20rpx);
  border-radius: 24rpx;
  border: 2rpx solid rgba(255, 255, 255, 0.3);
  box-shadow: 0 16rpx 60rpx rgba(102, 126, 234, 0.1);
}

/* 页面头部 */
.page-header {
  margin: 30rpx;
  padding: 32rpx;
}

.zone-info {
  display: flex;
  align-items: center;
  gap: 20rpx;
  margin-bottom: 24rpx;
}

.zone-icon {
  font-size: 56rpx;
}

.zone-detail {
  display: flex;
  flex-direction: column;
  gap: 8rpx;
}

.zone-name {
  font-size: 32rpx;
  font-weight: 700;
  color: #2d3748;
}

.zone-date {
  font-size: 26rpx;
  color: #718096;
}

.seat-stats {
  display: flex;
  gap: 32rpx;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 12rpx;
}

.stat-dot {
  width: 24rpx;
  height: 24rpx;
  border-radius: 50%;

  &.available {
    background: #22c55e;
  }

  &.occupied {
    background: #cbd5e0;
  }

  &.selected {
    background: #667eea;
  }
}

.stat-text {
  font-size: 24rpx;
  color: #4a5568;
}

/* 日期时段选择器 */
.datetime-selector {
  margin: 0 30rpx 30rpx;
  padding: 32rpx;
}

.selector-item {
  display: flex;
  align-items: center;
  padding: 24rpx 0;
  border-bottom: 2rpx solid #e2e8f0;

  &:last-child {
    border-bottom: none;
  }
}

.selector-label {
  font-size: 28rpx;
  color: #2d3748;
  font-weight: 600;
  min-width: 140rpx;
}

.selector-value {
  flex: 1;
  font-size: 28rpx;
  color: #667eea;
  font-weight: 600;
}

.selector-arrow {
  font-size: 40rpx;
  color: #cbd5e0;
}

.time-slots {
  flex: 1;
  display: flex;
  gap: 16rpx;
}

.time-slot {
  flex: 1;
  text-align: center;
  padding: 16rpx;
  background: #f7fafc;
  border-radius: 12rpx;
  font-size: 26rpx;
  color: #4a5568;
  transition: all 0.3s;

  &.active {
    background: linear-gradient(135deg, #667eea, #764ba2);
    color: white;
    font-weight: 600;
  }
}

/* 座位容器 */
.seats-container {
  margin: 0 30rpx;
}

.seats-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20rpx;
}

.seats-title {
  font-size: 32rpx;
  font-weight: 700;
  color: #2d3748;
}

.seats-tip {
  font-size: 24rpx;
  color: #a0aec0;
}

/* 舞台指示 */
.stage-indicator {
  text-align: center;
  padding: 20rpx;
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: white;
  border-radius: 12rpx;
  margin-bottom: 30rpx;
  font-size: 26rpx;
  font-weight: 600;
}

/* 座位网格 */
.seats-scroll {
  max-height: 900rpx;
  overflow: auto;
}

.seats-grid {
  display: flex;
  gap: 20rpx;
}

.row-labels {
  display: flex;
  flex-direction: column;
  gap: 16rpx;
  padding-top: 60rpx;
}

.row-label {
  width: 50rpx;
  height: 80rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28rpx;
  font-weight: 700;
  color: #667eea;
}

.seats-matrix {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 16rpx;
}

.seat-row {
  display: flex;
  gap: 16rpx;
}

.seat {
  flex: 1;
  height: 80rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  border-radius: 12rpx;
  transition: all 0.2s;
  position: relative;

  /* 可用 */
  &.seat-available {
    background: #d4f4dd;
    border: 3rpx solid #22c55e;

    &:active {
      transform: scale(0.95);
    }
  }

  /* 已占用 */
  &.seat-occupied {
    background: #e2e8f0;
    border: 3rpx solid #cbd5e0;
    opacity: 0.5;
  }

  /* 已选中 */
  &.seat-selected {
    background: linear-gradient(135deg, #667eea, #764ba2);
    border: 3rpx solid #764ba2;

    .seat-icon,
    .seat-label {
      color: white;
    }
  }

  /* 窗边座位 */
  &.seat-window::after {
    content: '🪟';
    position: absolute;
    top: -6rpx;
    right: -6rpx;
    font-size: 20rpx;
  }

  /* 卡座 */
  &.seat-booth::after {
    content: '🛋️';
    position: absolute;
    top: -6rpx;
    right: -6rpx;
    font-size: 20rpx;
  }
}

.seat-icon {
  font-size: 32rpx;
}

.seat-label {
  font-size: 20rpx;
  font-weight: 600;
  color: #2d3748;
  margin-top: 4rpx;
}

/* 图例 */
.legend {
  display: flex;
  justify-content: center;
  gap: 40rpx;
  margin-top: 30rpx;
  padding: 24rpx;
  background: #f7fafc;
  border-radius: 16rpx;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 12rpx;
  font-size: 24rpx;
  color: #4a5568;
}

.legend-icon {
  width: 40rpx;
  height: 40rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8rpx;
  font-size: 24rpx;

  &.window {
    background: #d4f4dd;
  }

  &.booth {
    background: #fef3c7;
  }

  &.standard {
    background: #dbeafe;
  }
}

/* 底部确认栏 */
.bottom-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 32rpx;
  border-top-left-radius: 32rpx;
  border-top-right-radius: 32rpx;
  box-shadow: 0 -8rpx 40rpx rgba(0, 0, 0, 0.1);
}

.selected-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8rpx;
}

.selected-count {
  font-size: 28rpx;
  font-weight: 700;
  color: #2d3748;
}

.selected-list {
  font-size: 24rpx;
  color: #667eea;
}

.confirm-btn {
  padding: 24rpx 48rpx;
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: white;
  border-radius: 100rpx;
  font-size: 28rpx;
  font-weight: 700;
  border: none;

  &::after {
    border: none;
  }
}
</style>
```

**验收标准**:
- [ ] 座位网格 8x6 完整显示
- [ ] 座位状态颜色正确（可用/已占/已选）
- [ ] 点击可用座位可选中/取消
- [ ] 窗边座位有特殊标识
- [ ] 底部确认栏显示选中信息
- [ ] 日期时段选择器功能正常
- [ ] 点击有震动反馈

---

### 📋 任务 3: 我的预约页 - 预约卡片组件 (P0)

#### 目标效果

精美的预约卡片列表，包括：
- 时间轴设计
- 状态徽章
- 操作按钮
- 下拉刷新

#### 实现要点

```vue
<!-- 预约卡片 -->
<view class="booking-card glass-card">
  <view class="booking-status-bar" :class="statusClass">
    <text>{{ statusText }}</text>
  </view>

  <view class="booking-content">
    <!-- 座位信息 -->
    <!-- 时间信息 -->
    <!-- 价格信息 -->
    <!-- 操作按钮 -->
  </view>
</view>
```

**验收标准**:
- [ ] 预约卡片设计美观
- [ ] 不同状态有不同颜色
- [ ] 操作按钮功能完整
- [ ] 下拉刷新正常

---

### 👤 任务 4: 个人中心页 - 数据可视化 (P1)

#### 目标效果

添加图表展示学习数据：
- 使用 uCharts 或 ECharts
- 学习时长柱状图
- 积分趋势折线图

**验收标准**:
- [ ] 图表显示正常
- [ ] 数据动画流畅
- [ ] 响应式布局

---

### 🎨 任务 5: 全局样式与主题 (P0)

#### 目标

统一全局样式和主题色：

**创建**: `frontend/packages/ui/src/styles/variables.scss`

```scss
// 主题色
$primary: #667eea;
$primary-dark: #764ba2;
$success: #22c55e;
$warning: #f59e0b;
$danger: #ef4444;
$info: #3b82f6;

// 文字颜色
$text-primary: #2d3748;
$text-secondary: #4a5568;
$text-muted: #718096;
$text-disabled: #a0aec0;

// 背景色
$bg-page: linear-gradient(180deg, #f8f9ff 0%, #fff 100%);
$bg-card: rgba(255, 255, 255, 0.7);
$bg-glass: rgba(255, 255, 255, 0.8);

// 圆角
$radius-sm: 12rpx;
$radius-md: 16rpx;
$radius-lg: 24rpx;
$radius-xl: 32rpx;
$radius-full: 100rpx;

// 阴影
$shadow-sm: 0 4rpx 20rpx rgba(0, 0, 0, 0.03);
$shadow-md: 0 8rpx 40rpx rgba(0, 0, 0, 0.08);
$shadow-lg: 0 16rpx 60rpx rgba(102, 126, 234, 0.1);

// 间距
$spacing-xs: 8rpx;
$spacing-sm: 16rpx;
$spacing-md: 24rpx;
$spacing-lg: 32rpx;
$spacing-xl: 48rpx;
```

**验收标准**:
- [ ] 全局变量文件创建
- [ ] 所有页面引用统一变量
- [ ] 主题色一致

---

### 📱 任务 6: H5 浏览器端适配 (P0)

#### 目标

确保在浏览器完美展示：

1. **响应式布局**
   - 使用 `rpx` 单位
   - 媒体查询适配大屏

2. **浏览器兼容性**
   - 测试 Chrome、Safari、Firefox
   - 修复样式差异

3. **性能优化**
   - 图片懒加载
   - 列表虚拟滚动（如需要）

**验收标准**:
- [ ] 在 Chrome 浏览器正常显示
- [ ] 在 Safari 浏览器正常显示
- [ ] 移动端浏览器正常显示
- [ ] 没有明显的性能问题

---

### 🎭 任务 7: 交互动效完善 (P1)

#### 目标效果

添加流畅的动画：

1. **页面过渡动画**
```scss
// 淡入动画
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(20rpx);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.page-enter {
  animation: fadeIn 0.3s ease;
}
```

2. **点击反馈**
   - 按钮点击缩放
   - 卡片点击波纹

3. **Loading 动画**
   - 骨架屏
   - 加载旋转

**验收标准**:
- [ ] 页面切换有过渡动画
- [ ] 按钮点击有视觉反馈
- [ ] Loading 状态美观

---

## 4. 模拟数据设计

### 精心设计真实场景的模拟数据

**原则**:
- 数据要真实可信
- 覆盖各种场景
- 便于展示功能

**示例**:

```typescript
// 区域模拟数据
const mockZones = [
  {
    id: 'zone-1',
    name: '静音研讨区',
    icon: '🤫',
    tags: ['绝对安静', '独立电源', '窗边'],
    hourlyPrice: 15,
    vipPrice: 12,
    capacity: 48,
    availableSeats: 12,
    crowdLevel: 75, // 拥挤度
    gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    description: '专为需要绝对安静的学习者打造，配备独立电源和舒适座椅。',
    features: ['隔音设计', 'Type-C 充电', '护眼台灯', '储物柜'],
    openTime: '07:00-23:00'
  },
  // ... 更多区域
]

// 预约模拟数据
const mockBookings = [
  {
    id: 'booking-1',
    status: 'CONFIRMED',
    seat: { id: 'A1', label: 'A-01' },
    zone: { id: 'zone-1', name: '静音研讨区' },
    bookingDate: '2026-01-25',
    startTime: '09:00',
    endTime: '12:00',
    totalAmount: 45,
    createdAt: '2026-01-24 18:30',
    canCancel: true,
    cancelDeadline: '2026-01-25 07:00'
  },
  {
    id: 'booking-2',
    status: 'IN_PROGRESS',
    seat: { id: 'B3', label: 'B-03' },
    zone: { id: 'zone-2', name: '协作办公区' },
    bookingDate: '2026-01-24',
    startTime: '14:00',
    endTime: '18:00',
    totalAmount: 48,
    checkInAt: '2026-01-24 14:05',
    checkOutAt: null
  },
  // ... 更多预约
]
```

---

## 5. 验收标准 (DoD - Definition of Done)

**必须满足以下所有条件**:

- [ ] ✅ 所有 7 个任务已完成
- [ ] ✅ 首页 UI 完整美观
- [ ] ✅ 选座页座位网格完整可用
- [ ] ✅ 我的预约页卡片设计完善
- [ ] ✅ 个人中心页布局完整
- [ ] ✅ 全局样式统一
- [ ] ✅ H5 浏览器端完美展示
- [ ] ✅ 所有交互动效流畅
- [ ] ✅ 使用精心设计的模拟数据
- [ ] ✅ 页面间导航正常
- [ ] ✅ 代码符合规范
- [ ] ✅ 提交消息符合约定式提交规范
- [ ] ✅ PR 通过 Architect Code Review

---

## 6. 开发流程

### 推荐开发顺序

```
1. 全局样式配置 (1 小时)
    ↓
2. 首页 UI 完善 (4-6 小时)
    ↓
3. 选座页座位网格 (6-8 小时)
    ↓
4. 我的预约页卡片 (4-6 小时)
    ↓
5. 个人中心页完善 (2-3 小时)
    ↓
6. H5 浏览器适配 (3-4 小时)
    ↓
7. 交互动效优化 (2-3 小时)
    ↓
8. 整体测试与优化 (4-6 小时)
```

**总计**: 3-4 天

### 开发命令

```bash
# 进入 UI 目录
cd frontend/packages/ui

# H5 浏览器端开发（推荐）
pnpm run dev:h5
# 浏览器访问 http://localhost:5173

# 微信小程序开发
pnpm run dev:mp-weixin

# 构建
pnpm run build:h5
```

---

## 7. 浏览器端测试清单

### Chrome 浏览器测试

- [ ] 首页所有组件正常显示
- [ ] 区域卡片渐变背景正常
- [ ] 座位网格布局正确
- [ ] 点击交互正常
- [ ] 动画流畅无卡顿
- [ ] Console 无错误

### 移动端浏览器测试

- [ ] iPhone Safari 正常
- [ ] Android Chrome 正常
- [ ] 响应式布局正确
- [ ] 触摸交互正常

### 功能测试

- [ ] 页面导航正常
- [ ] 底部 TabBar 切换正常
- [ ] 模拟数据显示正确
- [ ] 所有按钮可点击
- [ ] 弹窗正常显示

---

## 8. 参考资料

### UI 设计参考

- [Glassmorphism CSS Generator](https://hype4.academy/tools/glassmorphism-generator)
- [Coolors 配色方案](https://coolors.co/)
- [uiGradients 渐变背景](https://uigradients.com/)

### UniApp 文档

- [UniApp 官方文档](https://uniapp.dcloud.net.cn/)
- [uView Plus 组件库](https://uviewui.com/)
- [Wot Design Uni](https://wot-design-uni.netlify.app/)

### 动画库

- [Animate.css](https://animate.style/)
- [GSAP 动画库](https://greensock.com/gsap/)

---

## 9. 提交指南

### 提交消息格式

```bash
git commit -m "feat(ui): 完成首页 UI 完善

- 添加 Glassmorphism 风格卡片
- 实现区域卡片渐变背景
- 添加拥挤度进度条
- 实现快速操作浮动按钮

Related to #4"
```

### PR 标题

```
feat(ui): 前端 UI 完善与浏览器端完整呈现
```

---

## 10. 注意事项

### ⚠️ 重要提醒

1. **暂时保留模拟数据**
   - 使用精心设计的模拟数据
   - 数据要真实可信
   - 便于展示完整功能

2. **专注 UI 和交互**
   - 视觉设计要精美
   - 交互要流畅
   - 用户体验要好

3. **浏览器兼容性优先**
   - 优先确保 H5 端完美展示
   - 其他端可后续优化

4. **性能要注意**
   - 避免过度动画
   - 图片要优化
   - 列表要考虑性能

---

**工票创建者**: Architect
**工票创建日期**: 2026-01-24
**预计完成日期**: 2026-01-28
**优先级**: ⭐⭐⭐ P0
**前置工票**: 无
**后续工票**: Ticket-005 (前后端数据集成)
