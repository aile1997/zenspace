# Ticket-003: 前端 UI 层数据集成与修复

> **工票类型**: Frontend Development
> **优先级**: ⭐⭐⭐ P0 (阻塞性任务)
> **预估工作量**: 2-3 天
> **分配给**: Builder (前端)
> **状态**: 📋 待开始
> **创建日期**: 2026-01-24
> **依赖**: Core 层 Composables ✅

---

## 1. 任务背景

### Code Review 发现的问题

经过 Architect 的全面代码审查，发现前端 UI 层存在以下**严重问题**：

| 问题 | 严重程度 | 影响范围 |
|:-----|:--------|:--------|
| **UI 层未连接后端数据** | 🔴 高 | 4 个页面（首页、选座、我的预约、个人中心） |
| **API 基础 URL 硬编码** | 🔴 高 | 所有 HTTP 请求 |
| **pages.json 配置错误** | 🟠 中 | 底部 TabBar 导航 |

**当前状态**：
- ✅ **Core 层完成度**: 95% (Composables、Stores、Tests 完善)
- ⚠️ **UI 层完成度**: 60% (页面结构完成，但使用模拟数据)
- ⚠️ **整体完成度**: 77.5%

**示例问题代码**：

```vue
<!-- ❌ 错误示例：seat/index.vue -->
<script setup lang="ts">
import { ref, onMounted } from 'vue'

// 生成 48 行模拟座位数据
const generateMockSeats = (): Seat[] => { /* ... */ }

onMounted(() => {
  seats.value = generateMockSeats() // 硬编码数据！
})
</script>
```

```typescript
// ❌ 错误示例：main.ts
http: new UniHttp('http://localhost:3000/api/v1') // 硬编码 localhost！
```

---

## 2. 任务目标

将前端 UI 层的**所有页面**从模拟数据切换到真实的 Core 层 Composables，确保前后端数据流通畅。

### 核心任务清单

- [ ] 修复 API 基础 URL 配置（环境变量化）
- [ ] 集成首页数据（区域列表 + 实时统计）
- [ ] 集成选座页数据（真实座位查询）
- [ ] 集成我的预约页数据（预约列表 + 实时状态）
- [ ] 集成个人中心数据（用户信息 + 学习统计）
- [ ] 修复 pages.json 配置错误
- [ ] 添加 Loading 状态和错误处理

---

## 3. 详细修复任务

### 🔧 任务 1: 环境变量配置 (P0)

#### 问题描述

API 基础 URL 硬编码为 `localhost:3000`，导致：
- 无法在生产环境使用
- 无法快速切换开发/测试/生产环境

#### 解决方案

**步骤 1**: 创建环境变量文件

```bash
# 在 frontend/packages/ui/ 目录下创建以下文件
```

**`.env.development`** (开发环境):
```env
VITE_API_BASE_URL=http://localhost:3000/api/v1
VITE_APP_TITLE=ZenSpace (开发)
```

**`.env.production`** (生产环境):
```env
VITE_API_BASE_URL=https://api.zenspace.com/api/v1
VITE_APP_TITLE=ZenSpace
```

**步骤 2**: 修改 `main.ts`

```typescript
// frontend/packages/ui/src/main.ts

import { createSSRApp } from 'vue'
import * as Pinia from 'pinia'
import App from './App.vue'
import { registerAdapters } from '@zenspace/core'
import { UniStorage, UniHttp } from './utils/adapters'

export function createApp() {
  const app = createSSRApp(App)
  const pinia = Pinia.createPinia()
  app.use(pinia)

  // ✅ 修改：使用环境变量
  const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api/v1'

  registerAdapters({
    storage: new UniStorage(),
    http: new UniHttp(apiBaseUrl),
  })

  return {
    app,
    Pinia,
  }
}
```

**步骤 3**: 添加类型声明

创建 `frontend/packages/ui/src/env.d.ts`:

```typescript
/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL: string
  readonly VITE_APP_TITLE: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
```

**验收标准**:
- [ ] 三个环境文件已创建
- [ ] main.ts 使用环境变量
- [ ] 本地开发能正常连接 API
- [ ] 可通过 `pnpm run build:prod` 构建生产版本

---

### 📱 任务 2: 首页数据集成 (P0)

#### 当前问题

**文件**: `frontend/packages/ui/src/pages/index/index.vue`

```vue
<!-- ❌ 硬编码的拥挤度数据 -->
<text class="stat-value">82<span class="stat-percent">%</span></text>
<text class="stat-value">45<span class="stat-percent">%</span></text>
<text class="stat-value">12<span class="stat-percent">%</span></text>

<script setup lang="ts">
onMounted(() => {
  userStore.restore() // 仅恢复用户状态，未加载区域数据
})
</script>
```

#### 解决方案

```vue
<template>
  <view class="page">
    <!-- Loading 状态 -->
    <view v-if="loading" class="loading-container">
      <text>加载中...</text>
    </view>

    <!-- 错误状态 -->
    <view v-else-if="error" class="error-container">
      <text>{{ error }}</text>
      <button @click="loadData">重试</button>
    </view>

    <!-- 数据已加载 -->
    <view v-else>
      <!-- 统计数据 - 使用真实数据 -->
      <view class="stats-grid">
        <view class="stat-item">
          <text class="stat-label">今日总座位</text>
          <text class="stat-value">{{ totalSeats }}</text>
        </view>
        <view class="stat-item">
          <text class="stat-label">已预约</text>
          <text class="stat-value">
            {{ occupiedSeats }}
            <span class="stat-percent">/ {{ occupancyRate }}%</span>
          </text>
        </view>
        <view class="stat-item">
          <text class="stat-label">可用座位</text>
          <text class="stat-value">{{ availableSeats }}</text>
        </view>
      </view>

      <!-- 区域列表 - 使用真实数据 -->
      <view class="zones-section">
        <view class="section-header">
          <text class="section-title">选择区域</text>
        </view>
        <view class="zones-grid">
          <view
            v-for="zone in zones"
            :key="zone.id"
            class="zone-card"
            @click="navigateToSeat(zone.id)"
          >
            <view class="zone-header">
              <text class="zone-name">{{ zone.name }}</text>
              <text class="zone-price">¥{{ zone.hourlyPrice }}/小时</text>
            </view>
            <view class="zone-info">
              <text class="zone-capacity">{{ zone.availableSeats }}/{{ zone.capacity }} 可用</text>
              <text :class="['zone-status', getCrowdClass(zone.crowdLevel)]">
                {{ getCrowdText(zone.crowdLevel) }}
              </text>
            </view>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useUserStore } from '@zenspace/core/stores/user'
import { useZone } from '@zenspace/core/composables/useZone'
import type { Zone } from '@zenspace/core/types'

// Stores & Composables
const userStore = useUserStore()
const { zones, loading: zonesLoading, fetchZones } = useZone()

// 状态管理
const loading = ref(true)
const error = ref('')

// 计算属性 - 座位统计
const totalSeats = computed(() => {
  return zones.value.reduce((sum, zone) => sum + zone.capacity, 0)
})

const occupiedSeats = computed(() => {
  return zones.value.reduce((sum, zone) => sum + (zone.capacity - zone.availableSeats), 0)
})

const availableSeats = computed(() => {
  return zones.value.reduce((sum, zone) => sum + zone.availableSeats, 0)
})

const occupancyRate = computed(() => {
  if (totalSeats.value === 0) return 0
  return Math.round((occupiedSeats.value / totalSeats.value) * 100)
})

// 方法
const getCrowdClass = (level: number) => {
  if (level >= 80) return 'crowd-high'
  if (level >= 50) return 'crowd-medium'
  return 'crowd-low'
}

const getCrowdText = (level: number) => {
  if (level >= 80) return '拥挤'
  if (level >= 50) return '适中'
  return '空闲'
}

const navigateToSeat = (zoneId: string) => {
  uni.navigateTo({
    url: `/pages/seat/index?zoneId=${zoneId}`
  })
}

const loadData = async () => {
  try {
    loading.value = true
    error.value = ''

    // 恢复用户状态
    await userStore.restore()

    // 加载区域数据
    await fetchZones()

  } catch (e: any) {
    error.value = e.message || '数据加载失败'
    console.error('首页数据加载失败:', e)
  } finally {
    loading.value = false
  }
}

// 生命周期
onMounted(() => {
  loadData()
})
</script>
```

**验收标准**:
- [ ] 首页显示真实的座位统计数据
- [ ] 区域列表从后端 API 获取
- [ ] 拥挤度根据实际座位占用率计算
- [ ] 添加 Loading 状态
- [ ] 添加错误处理和重试功能
- [ ] 点击区域卡片能正确跳转到选座页

---

### 🪑 任务 3: 选座页数据集成 (P0)

#### 当前问题

**文件**: `frontend/packages/ui/src/pages/seat/index.vue`

```vue
<script setup lang="ts">
// ❌ 完全使用模拟数据
const generateMockSeats = (): Seat[] => {
  const mockSeats: Seat[] = []
  // ... 48 行模拟代码
  return mockSeats
}

onMounted(() => {
  seats.value = generateMockSeats() // 硬编码！
})
</script>
```

#### 解决方案

```vue
<template>
  <view class="page">
    <!-- 日期时段选择器 -->
    <view class="date-time-selector">
      <picker mode="date" :value="selectedDate" @change="onDateChange">
        <view class="picker-item">
          <text>{{ selectedDate }}</text>
          <text class="icon">📅</text>
        </view>
      </picker>
      <!-- 时段选择 -->
      <view class="time-slots">
        <text
          v-for="slot in timeSlots"
          :key="slot"
          :class="['time-slot', { active: selectedTime === slot }]"
          @click="selectedTime = slot"
        >
          {{ slot }}
        </text>
      </view>
    </view>

    <!-- 座位网格 -->
    <view v-if="loading" class="loading">
      <text>加载座位中...</text>
    </view>

    <view v-else-if="error" class="error">
      <text>{{ error }}</text>
      <button @click="loadSeats">重试</button>
    </view>

    <view v-else class="seats-container">
      <!-- 座位统计 -->
      <view class="seats-stats">
        <text>总计: {{ seats.length }}</text>
        <text>可用: {{ availableCount }}</text>
        <text>已占: {{ occupiedCount }}</text>
      </view>

      <!-- 座位网格 -->
      <view class="seats-grid">
        <view
          v-for="seat in seats"
          :key="seat.id"
          :class="[
            'seat-item',
            `seat-${seat.status.toLowerCase()}`,
            { selected: selectedSeatId === seat.id }
          ]"
          @click="handleSeatClick(seat)"
        >
          <text class="seat-label">{{ seat.label }}</text>
          <text v-if="seat.type === 'WINDOW'" class="seat-icon">🪟</text>
        </view>
      </view>
    </view>

    <!-- 预约确认弹窗 -->
    <view v-if="showBookingModal" class="modal">
      <view class="modal-content">
        <text class="modal-title">确认预约</text>
        <view class="booking-info">
          <text>座位: {{ selectedSeat?.label }}</text>
          <text>日期: {{ selectedDate }}</text>
          <text>时段: {{ selectedTime }}</text>
          <text>价格: ¥{{ calculatePrice() }}</text>
        </view>
        <view class="modal-actions">
          <button @click="showBookingModal = false">取消</button>
          <button type="primary" @click="confirmBooking" :loading="bookingLoading">
            确认预约
          </button>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useSeat } from '@zenspace/core/composables/useSeat'
import { useBooking } from '@zenspace/core/composables/useBooking'
import { useToastStore } from '@zenspace/core/stores/toast'
import { getToday } from '@zenspace/core/utils/date'
import type { Seat } from '@zenspace/core/types'

// Props (从首页传入的区域 ID)
const props = defineProps<{
  zoneId?: string
}>()

// Composables
const { seats, loading, fetchZoneSeats, selectSeat, selectedSeat, clearSelection } = useSeat()
const { createBooking } = useBooking()
const toastStore = useToastStore()

// 状态
const error = ref('')
const selectedDate = ref(getToday())
const selectedTime = ref('09:00-12:00')
const timeSlots = ['09:00-12:00', '13:00-17:00', '18:00-22:00']
const showBookingModal = ref(false)
const bookingLoading = ref(false)

// 计算属性
const selectedSeatId = computed(() => selectedSeat.value?.id)

const availableCount = computed(() => {
  return seats.value.filter(s => s.status === 'AVAILABLE').length
})

const occupiedCount = computed(() => {
  return seats.value.filter(s => s.status === 'OCCUPIED').length
})

// 方法
const loadSeats = async () => {
  try {
    error.value = ''
    const zoneId = props.zoneId || 'zone-1' // 默认静音研讨区
    await fetchZoneSeats(zoneId)
  } catch (e: any) {
    error.value = e.message || '座位加载失败'
  }
}

const handleSeatClick = (seat: Seat) => {
  if (seat.status !== 'AVAILABLE') {
    toastStore.showInfo('该座位不可用')
    return
  }

  selectSeat(seat.id)
  showBookingModal.value = true
}

const calculatePrice = () => {
  // 根据时段计算价格（简化版，实际应从 zone 信息获取）
  const hours = selectedTime.value === '18:00-22:00' ? 4 : 3
  return hours * 15 // 假设 15 元/小时
}

const confirmBooking = async () => {
  if (!selectedSeat.value) return

  try {
    bookingLoading.value = true

    // 解析时段
    const [startTime, endTime] = selectedTime.value.split('-')

    // 创建预约
    await createBooking({
      seatId: selectedSeat.value.id,
      zoneId: props.zoneId || 'zone-1',
      bookingDate: selectedDate.value,
      startTime,
      endTime
    })

    toastStore.showSuccess('预约成功！')
    showBookingModal.value = false
    clearSelection()

    // 跳转到我的预约
    setTimeout(() => {
      uni.switchTab({ url: '/pages/my-appointments/index' })
    }, 1500)

  } catch (e: any) {
    toastStore.showError(e.message || '预约失败')
  } finally {
    bookingLoading.value = false
  }
}

// 监听日期/时段变化，重新加载座位
watch([selectedDate, selectedTime], () => {
  loadSeats()
})

// 生命周期
onMounted(() => {
  loadSeats()
})
</script>
```

**验收标准**:
- [ ] 删除 `generateMockSeats()` 模拟数据函数
- [ ] 使用 `useSeat().fetchZoneSeats()` 获取真实座位
- [ ] 座位状态实时更新
- [ ] 日期/时段选择器功能正常
- [ ] 预约确认弹窗功能完整
- [ ] 预约成功后跳转到我的预约页

---

### 📋 任务 4: 我的预约页数据集成 (P0)

#### 当前问题

**文件**: `frontend/packages/ui/src/pages/my-appointments/index.vue`

```vue
<script setup lang="ts">
// ❌ 硬编码的预约数据
const mockBookings: Booking[] = [
  {
    id: '1',
    seatLabel: 'A-01',
    zoneName: '静音研讨区',
    // ... 硬编码数据
  }
]

onMounted(() => {
  bookings.value = mockBookings // 完全不调用 API
})
</script>
```

#### 解决方案

```vue
<template>
  <view class="page">
    <!-- 标签栏 -->
    <view class="tabs">
      <text
        v-for="tab in tabs"
        :key="tab.status"
        :class="['tab', { active: activeTab === tab.status }]"
        @click="activeTab = tab.status"
      >
        {{ tab.label }}
        <text v-if="getTabCount(tab.status) > 0" class="badge">
          {{ getTabCount(tab.status) }}
        </text>
      </text>
    </view>

    <!-- 预约列表 -->
    <view v-if="loading" class="loading">
      <text>加载中...</text>
    </view>

    <view v-else-if="error" class="error">
      <text>{{ error }}</text>
      <button @click="loadBookings">重试</button>
    </view>

    <view v-else-if="filteredBookings.length === 0" class="empty">
      <text>暂无{{ activeTabLabel }}的预约</text>
    </view>

    <view v-else class="bookings-list">
      <view
        v-for="booking in filteredBookings"
        :key="booking.id"
        class="booking-card"
      >
        <!-- 预约信息 -->
        <view class="booking-header">
          <text class="seat-label">{{ booking.seat?.label || '座位' }}</text>
          <text :class="['status-badge', `status-${booking.status.toLowerCase()}`]">
            {{ getStatusText(booking.status) }}
          </text>
        </view>

        <view class="booking-info">
          <text>📍 {{ booking.zone?.name || '区域' }}</text>
          <text>📅 {{ booking.bookingDate }} {{ booking.startTime }}-{{ booking.endTime }}</text>
          <text>💰 ¥{{ booking.totalAmount }}</text>
        </view>

        <!-- 操作按钮 -->
        <view class="booking-actions">
          <!-- 待支付 -->
          <button
            v-if="booking.status === 'PENDING_PAYMENT'"
            type="primary"
            size="mini"
            @click="handlePay(booking.id)"
          >
            去支付
          </button>
          <button
            v-if="booking.status === 'PENDING_PAYMENT'"
            size="mini"
            @click="handleCancel(booking.id)"
          >
            取消
          </button>

          <!-- 已确认 -->
          <button
            v-if="booking.status === 'CONFIRMED'"
            type="primary"
            size="mini"
            @click="handleCheckIn(booking.id)"
          >
            签到
          </button>
          <button
            v-if="booking.status === 'CONFIRMED'"
            size="mini"
            @click="handleCancel(booking.id)"
          >
            取消预约
          </button>

          <!-- 进行中 -->
          <button
            v-if="booking.status === 'IN_PROGRESS'"
            type="warn"
            size="mini"
            @click="handleCheckOut(booking.id)"
          >
            签退
          </button>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useBooking } from '@zenspace/core/composables/useBooking'
import { useToastStore } from '@zenspace/core/stores/toast'
import type { BookingStatus } from '@zenspace/core/types'

// Composables
const { bookings, loading, fetchBookings, cancelBooking, checkIn, checkOut } = useBooking()
const toastStore = useToastStore()

// 状态
const error = ref('')
const activeTab = ref<BookingStatus | 'ALL'>('ALL')

// 标签配置
const tabs = [
  { status: 'ALL' as const, label: '全部' },
  { status: 'PENDING_PAYMENT' as const, label: '待支付' },
  { status: 'CONFIRMED' as const, label: '已确认' },
  { status: 'IN_PROGRESS' as const, label: '进行中' },
  { status: 'COMPLETED' as const, label: '已完成' },
]

// 计算属性
const filteredBookings = computed(() => {
  if (activeTab.value === 'ALL') return bookings.value
  return bookings.value.filter(b => b.status === activeTab.value)
})

const activeTabLabel = computed(() => {
  return tabs.find(t => t.status === activeTab.value)?.label || ''
})

// 方法
const getTabCount = (status: BookingStatus | 'ALL') => {
  if (status === 'ALL') return bookings.value.length
  return bookings.value.filter(b => b.status === status).length
}

const getStatusText = (status: BookingStatus) => {
  const statusMap: Record<BookingStatus, string> = {
    PENDING_PAYMENT: '待支付',
    CONFIRMED: '已确认',
    IN_PROGRESS: '进行中',
    COMPLETED: '已完成',
    CANCELLED: '已取消',
    NO_SHOW: '未到场'
  }
  return statusMap[status] || status
}

const loadBookings = async () => {
  try {
    error.value = ''
    await fetchBookings()
  } catch (e: any) {
    error.value = e.message || '预约加载失败'
  }
}

const handlePay = (bookingId: string) => {
  // TODO: 集成支付功能
  toastStore.showInfo('支付功能开发中')
}

const handleCancel = async (bookingId: string) => {
  try {
    await cancelBooking(bookingId)
    toastStore.showSuccess('预约已取消')
    await loadBookings() // 刷新列表
  } catch (e: any) {
    toastStore.showError(e.message || '取消失败')
  }
}

const handleCheckIn = async (bookingId: string) => {
  try {
    await checkIn(bookingId)
    toastStore.showSuccess('签到成功')
    await loadBookings()
  } catch (e: any) {
    toastStore.showError(e.message || '签到失败')
  }
}

const handleCheckOut = async (bookingId: string) => {
  try {
    await checkOut(bookingId)
    toastStore.showSuccess('签退成功')
    await loadBookings()
  } catch (e: any) {
    toastStore.showError(e.message || '签退失败')
  }
}

// 生命周期
onMounted(() => {
  loadBookings()
})

// 页面显示时刷新
onShow(() => {
  loadBookings()
})
</script>
```

**验收标准**:
- [ ] 删除 `mockBookings` 硬编码数据
- [ ] 使用 `useBooking().fetchBookings()` 获取真实预约
- [ ] 标签栏筛选功能正常
- [ ] 取消预约功能正常
- [ ] 签到/签退功能正常
- [ ] 页面显示时自动刷新数据

---

### 👤 任务 5: 个人中心数据集成 (P1)

#### 当前问题

**文件**: `frontend/packages/ui/src/pages/profile/index.vue`

```vue
<script setup lang="ts">
// ❌ 硬编码的统计数据
const stats = [
  { label: '学习时长', value: '128', unit: '小时' },  // 硬编码
  { label: '完成预约', value: '45', unit: '次' },    // 硬编码
  { label: '累计积分', value: '1580', unit: '分' },  // 硬编码
]
</script>
```

#### 解决方案

```vue
<template>
  <view class="page">
    <!-- 用户信息卡片 -->
    <view class="user-card">
      <image :src="user?.avatar || '/static/default-avatar.png'" class="avatar" />
      <view class="user-info">
        <text class="nickname">{{ user?.nickname || user?.phone || '未登录' }}</text>
        <text class="level-badge" :class="`level-${user?.level.toLowerCase()}`">
          {{ user?.level === 'VIP' ? 'VIP 会员' : '普通用户' }}
        </text>
      </view>
      <text class="points">{{ user?.points || 0 }} 积分</text>
    </view>

    <!-- 学习统计 -->
    <view class="stats-grid">
      <view v-for="stat in stats" :key="stat.label" class="stat-item">
        <text class="stat-value">{{ stat.value }}<span class="stat-unit">{{ stat.unit }}</span></text>
        <text class="stat-label">{{ stat.label }}</text>
      </view>
    </view>

    <!-- 菜单列表 -->
    <view class="menu-list">
      <view class="menu-item" @click="navigateTo('/pages/bookings/index')">
        <text class="menu-icon">📋</text>
        <text class="menu-label">我的预约</text>
        <text class="menu-arrow">›</text>
      </view>
      <view class="menu-item" @click="navigateTo('/pages/wallet/index')">
        <text class="menu-icon">💰</text>
        <text class="menu-label">我的钱包</text>
        <text class="menu-arrow">›</text>
      </view>
      <view class="menu-item" @click="navigateTo('/pages/points/index')">
        <text class="menu-icon">🎁</text>
        <text class="menu-label">积分商城</text>
        <text class="menu-arrow">›</text>
      </view>
      <view class="menu-item" @click="navigateTo('/pages/settings/index')">
        <text class="menu-icon">⚙️</text>
        <text class="menu-label">设置</text>
        <text class="menu-arrow">›</text>
      </view>
    </view>

    <!-- 退出登录 -->
    <view class="logout-section">
      <button @click="handleLogout" :loading="logoutLoading">退出登录</button>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useUserStore } from '@zenspace/core/stores/user'
import { useBookingStore } from '@zenspace/core/stores/booking'
import { useAuth } from '@zenspace/core/composables/useAuth'
import { useToastStore } from '@zenspace/core/stores/toast'

// Stores & Composables
const userStore = useUserStore()
const bookingStore = useBookingStore()
const { logout } = useAuth()
const toastStore = useToastStore()

// 状态
const logoutLoading = ref(false)

// 计算属性
const user = computed(() => userStore.user)

const stats = computed(() => {
  // TODO: 后续从后端 API 获取真实统计数据
  const completedBookings = bookingStore.bookings.filter(b => b.status === 'COMPLETED').length

  return [
    { label: '学习时长', value: '0', unit: '小时' }, // 待后端 API
    { label: '完成预约', value: String(completedBookings), unit: '次' },
    { label: '累计积分', value: String(user.value?.points || 0), unit: '分' },
  ]
})

// 方法
const navigateTo = (url: string) => {
  uni.navigateTo({ url })
}

const handleLogout = async () => {
  try {
    logoutLoading.value = true
    await logout()
    toastStore.showSuccess('已退出登录')

    // 跳转到登录页
    setTimeout(() => {
      uni.reLaunch({ url: '/pages/login/index' })
    }, 1000)

  } catch (e: any) {
    toastStore.showError(e.message || '退出失败')
  } finally {
    logoutLoading.value = false
  }
}

// 生命周期
onMounted(() => {
  // 确保用户数据已恢复
  userStore.restore()
})
</script>
```

**验收标准**:
- [ ] 用户信息从 `useUserStore` 获取
- [ ] 积分显示真实数据
- [ ] 完成预约数从 `bookingStore` 计算
- [ ] 退出登录功能正常
- [ ] 菜单项可导航（即使目标页面未实现）

---

### 🔧 任务 6: 修复 pages.json 配置 (P0)

#### 当前问题

```json
{
  "tabBar": {
    "list": [
      { "pagePath": "pages/index/index", "text": "首页" },
      { "pagePath": "pages/seat/index", "text": "预约" },
      { "pagePath": "pages/my-appointments/index", "text": "预约" },  // ❌ 重复
      { "pagePath": "pages/profile/index", "text": "我的" }
    ]
  }
}
```

#### 解决方案

```json
{
  "pages": [
    {
      "path": "pages/index/index",
      "style": {
        "navigationBarTitleText": "ZenSpace"
      }
    },
    {
      "path": "pages/login/index",
      "style": {
        "navigationBarTitleText": "登录",
        "navigationStyle": "custom"
      }
    },
    {
      "path": "pages/seat/index",
      "style": {
        "navigationBarTitleText": "选择座位"
      }
    },
    {
      "path": "pages/my-appointments/index",
      "style": {
        "navigationBarTitleText": "我的预约"
      }
    },
    {
      "path": "pages/profile/index",
      "style": {
        "navigationBarTitleText": "个人中心"
      }
    }
  ],
  "tabBar": {
    "color": "#666666",
    "selectedColor": "#6366f1",
    "backgroundColor": "#ffffff",
    "borderStyle": "black",
    "list": [
      {
        "pagePath": "pages/index/index",
        "text": "首页",
        "iconPath": "static/tab-home.png",
        "selectedIconPath": "static/tab-home-active.png"
      },
      {
        "pagePath": "pages/seat/index",
        "text": "预约",
        "iconPath": "static/tab-seat.png",
        "selectedIconPath": "static/tab-seat-active.png"
      },
      {
        "pagePath": "pages/my-appointments/index",
        "text": "我的预约",
        "iconPath": "static/tab-bookings.png",
        "selectedIconPath": "static/tab-bookings-active.png"
      },
      {
        "pagePath": "pages/profile/index",
        "text": "我的",
        "iconPath": "static/tab-profile.png",
        "selectedIconPath": "static/tab-profile-active.png"
      }
    ]
  },
  "globalStyle": {
    "navigationBarTextStyle": "black",
    "navigationBarTitleText": "ZenSpace",
    "navigationBarBackgroundColor": "#ffffff",
    "backgroundColor": "#f5f5f5"
  }
}
```

**验收标准**:
- [ ] tabBar 移除重复的 "预约" 文本
- [ ] 第三个 tab 改为 "我的预约"
- [ ] 添加 tabBar 图标（如果有设计）
- [ ] 配置正确的颜色主题

---

### ⚡ 任务 7: 添加全局 Loading 和错误处理 (P1)

#### 目标

为所有页面添加统一的 Loading 状态和错误处理。

#### 解决方案

**创建 Loading 组件**: `frontend/packages/ui/src/components/Loading.vue`

```vue
<template>
  <view v-if="show" class="loading-overlay">
    <view class="loading-spinner">
      <text class="spinner-icon">⏳</text>
      <text class="loading-text">{{ text }}</text>
    </view>
  </view>
</template>

<script setup lang="ts">
defineProps<{
  show: boolean
  text?: string
}>()
</script>

<style scoped>
.loading-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.3);
  z-index: 9999;
}

.loading-spinner {
  background: white;
  border-radius: 16rpx;
  padding: 60rpx 80rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20rpx;
}

.spinner-icon {
  font-size: 60rpx;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.loading-text {
  font-size: 28rpx;
  color: #666;
}
</style>
```

**创建 Error 组件**: `frontend/packages/ui/src/components/ErrorState.vue`

```vue
<template>
  <view class="error-state">
    <text class="error-icon">😕</text>
    <text class="error-message">{{ message }}</text>
    <button v-if="showRetry" @click="$emit('retry')" class="retry-btn">
      重试
    </button>
  </view>
</template>

<script setup lang="ts">
defineProps<{
  message: string
  showRetry?: boolean
}>()

defineEmits<{
  retry: []
}>()
</script>

<style scoped>
.error-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 120rpx 60rpx;
  gap: 30rpx;
}

.error-icon {
  font-size: 120rpx;
}

.error-message {
  font-size: 28rpx;
  color: #999;
  text-align: center;
}

.retry-btn {
  margin-top: 20rpx;
}
</style>
```

**验收标准**:
- [ ] Loading 组件创建并可复用
- [ ] ErrorState 组件创建并可复用
- [ ] 所有页面使用统一的 Loading/Error 组件

---

## 4. 测试要求

### 4.1 手动测试清单

**页面功能测试**:

- [ ] 首页
  - [ ] 座位统计数据正确显示
  - [ ] 区域列表加载成功
  - [ ] 点击区域卡片能跳转到选座页
  - [ ] Loading 状态正常
  - [ ] 错误处理正常

- [ ] 选座页
  - [ ] 座位列表加载成功
  - [ ] 座位状态显示正确（可用/已占/维护中）
  - [ ] 日期时段选择器正常
  - [ ] 点击座位弹出预约确认
  - [ ] 预约成功后跳转

- [ ] 我的预约页
  - [ ] 预约列表加载成功
  - [ ] 标签栏筛选正常
  - [ ] 取消预约功能正常
  - [ ] 签到/签退功能正常
  - [ ] 状态徽章显示正确

- [ ] 个人中心
  - [ ] 用户信息显示正确
  - [ ] 积分显示正确
  - [ ] 统计数据显示正确
  - [ ] 退出登录功能正常

**环境配置测试**:

- [ ] 开发环境能连接本地 API
- [ ] 生产构建能使用生产 API
- [ ] 环境变量切换正常

### 4.2 集成测试（可选）

如果时间允许，可以为 UI 层添加 E2E 测试（使用 Playwright 或 Cypress）。

---

## 5. 验收标准 (DoD - Definition of Done)

**必须满足以下所有条件才能认为任务完成**:

- [ ] ✅ 所有 7 个子任务已完成
- [ ] ✅ 删除所有模拟数据代码（generateMockSeats, mockBookings 等）
- [ ] ✅ 所有页面连接到真实的 Composables
- [ ] ✅ API 基础 URL 使用环境变量
- [ ] ✅ pages.json 配置正确
- [ ] ✅ 所有页面有 Loading 和 Error 状态
- [ ] ✅ 手动测试通过率 100%
- [ ] ✅ 代码通过 ESLint 检查
- [ ] ✅ 提交消息符合约定式提交规范
- [ ] ✅ PR 通过 Architect Code Review

---

## 6. 开发流程

### 推荐顺序

```
1. 环境变量配置 (30 分钟)
    ↓
2. pages.json 修复 (15 分钟)
    ↓
3. 首页数据集成 (1-2 小时)
    ↓
4. 选座页数据集成 (2-3 小时)
    ↓
5. 我的预约页数据集成 (1-2 小时)
    ↓
6. 个人中心数据集成 (1 小时)
    ↓
7. 添加 Loading/Error 组件 (1 小时)
    ↓
8. 手动测试与修复 (2-3 小时)
```

### 开发命令

```bash
# 进入 UI 目录
cd frontend/packages/ui

# 开发模式（H5）
pnpm run dev:h5

# 开发模式（微信小程序）
pnpm run dev:mp-weixin

# 构建生产版本
pnpm run build:h5
```

---

## 7. 依赖与前置条件

### 前置条件

- ✅ Core 层 Composables 已完成
- ✅ Core 层 Stores 已完成
- ✅ Core 层测试已通过
- ⚠️ 后端 API 需要可用（可先使用 Mock API）

### Mock API 方案（可选）

如果后端 API 尚未完成，可以临时使用 Mock Service Worker (MSW) 或 json-server：

```bash
# 安装 json-server（可选）
pnpm add -D json-server

# 创建 mock-api/db.json
# 运行 Mock API
npx json-server --watch mock-api/db.json --port 3000
```

---

## 8. 注意事项

### ⚠️ 重要提醒

1. **不要直接删除模拟代码**
   - 先确保真实数据能正常加载
   - 测试通过后再删除模拟代码

2. **保持接口围栏规则**
   - UI 层可以使用 `uni.xxx` API
   - 但不要在 Core 层引入平台 API

3. **错误处理要完善**
   - 网络错误
   - 数据格式错误
   - 业务逻辑错误

4. **Loading 状态要明确**
   - 用户操作要有即时反馈
   - 避免长时间无响应

---

## 9. 参考资料

- [UniApp 官方文档](https://uniapp.dcloud.net.cn/)
- [Vue 3 Composition API](https://cn.vuejs.org/guide/extras/composition-api-faq.html)
- [Pinia 状态管理](https://pinia.vuejs.org/)
- [Vite 环境变量](https://cn.vitejs.dev/guide/env-and-mode.html)

---

## 10. 提交指南

### 提交消息格式

```bash
# 每个子任务单独提交

git commit -m "feat(ui): 添加环境变量配置

- 创建 .env.development 和 .env.production
- 修改 main.ts 使用环境变量
- 添加 TypeScript 环境变量类型声明

Related to #3"

git commit -m "fix(ui): 修复 pages.json tabBar 配置

- 移除重复的 '预约' 标签
- 第三个 tab 改为 '我的预约'
- 添加 tabBar 颜色配置

Related to #3"

git commit -m "feat(ui): 首页数据集成

- 删除硬编码的拥挤度数据
- 使用 useZone().fetchZones() 获取真实数据
- 添加 Loading 和错误处理
- 座位统计根据真实数据计算

Related to #3"

# ... 其他提交
```

### PR 标题

```
feat(ui): 完成前端 UI 层数据集成与修复
```

---

## 11. 联系方式

**有疑问?** 请查阅以下文档或联系 Architect：

- `.claude/memory/architecture_overview.md` - 架构总览
- `.claude/memory/project_status.md` - 项目状态看板
- `.claude/contracts/prd.md` - 产品需求文档

---

**工票创建者**: Architect
**工票创建日期**: 2026-01-24
**预计完成日期**: 2026-01-27
**前置工票**: 无
**后续工票**: Ticket-004 (后端 API 开发)
