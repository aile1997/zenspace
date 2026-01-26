# Ticket-006: 预约管理 API + 企业级 UI 打通

**优先级**: 🔥 P0（核心功能）  
**类型**: Feature  
**预计工时**: 后端 6-8h + 前端 6-8h = 12-16h  
**目标**: 打通前后端核心预约流程，呈现企业级高级感 UI

---

## 🎯 核心目标

### 1. 打通前后端交互
- 实现完整的预约业务流程（创建、查询、取消）
- 区域和座位的实时数据展示
- 前端完全连接真实 API

### 2. 企业级 UI 呈现
- **高级感**：精致的视觉细节和微交互
- **吸引眼球**：流畅的动画和过渡效果
- **高大上**：Apple/Tesla 级别的极简精致
- **让人惊讶**：超出预期的交互体验

---

## 📋 后端 API 开发

### API 1: 获取区域列表（带实时占用率）

**端点**: `GET /api/zones`

**响应示例**:
```json
{
  "zones": [
    {
      "id": "zone-1f",
      "name": "1F 综合阅览区",
      "floor": 1,
      "description": "开放式阅览空间，配备舒适座椅",
      "capacity": 48,
      "availableSeats": 9,
      "occupancyRate": 81.25,
      "status": "BUSY",
      "hourlyPrice": 10,
      "features": ["WiFi", "充电插座", "自然采光"],
      "openTime": "08:00",
      "closeTime": "22:00"
    }
  ]
}
```

**实现要点**:
```typescript
// backend/src/modules/booking/booking.controller.ts
@Get('zones')
async getZones() {
  const zones = await this.bookingService.getZonesWithOccupancy();
  return { zones };
}

// booking.service.ts
async getZonesWithOccupancy() {
  const zones = await this.prisma.zone.findMany({
    include: {
      seats: {
        select: {
          status: true,
        },
      },
    },
  });

  return zones.map(zone => {
    const totalSeats = zone.seats.length;
    const availableSeats = zone.seats.filter(s => s.status === 'AVAILABLE').length;
    const occupancyRate = ((totalSeats - availableSeats) / totalSeats * 100).toFixed(2);

    return {
      ...zone,
      capacity: totalSeats,
      availableSeats,
      occupancyRate: parseFloat(occupancyRate),
      status: this.calculateZoneStatus(occupancyRate),
    };
  });
}

private calculateZoneStatus(occupancyRate: number): string {
  if (occupancyRate >= 80) return 'BUSY';
  if (occupancyRate >= 50) return 'MODERATE';
  return 'AVAILABLE';
}
```

---

### API 2: 获取区域座位列表

**端点**: `GET /api/zones/:zoneId/seats`

**响应示例**:
```json
{
  "zone": {
    "id": "zone-1f",
    "name": "1F 综合阅览区"
  },
  "seats": [
    {
      "id": "seat-A1",
      "row": "A",
      "column": 1,
      "number": "A1",
      "status": "AVAILABLE",
      "type": "STANDARD",
      "features": ["窗边", "电源插座"],
      "currentBooking": null
    },
    {
      "id": "seat-A2",
      "row": "A",
      "column": 2,
      "number": "A2",
      "status": "OCCUPIED",
      "type": "STANDARD",
      "features": ["电源插座"],
      "currentBooking": {
        "endTime": "2026-01-26T18:00:00Z"
      }
    }
  ]
}
```

**实现要点**:
```typescript
@Get('zones/:zoneId/seats')
async getZoneSeats(@Param('zoneId') zoneId: string) {
  const zone = await this.prisma.zone.findUnique({
    where: { id: zoneId },
    select: { id: true, name: true },
  });

  const seats = await this.prisma.seat.findMany({
    where: { zoneId },
    include: {
      bookings: {
        where: {
          status: 'CONFIRMED',
          endTime: { gte: new Date() },
        },
        orderBy: { startTime: 'asc' },
        take: 1,
      },
    },
    orderBy: [{ row: 'asc' }, { column: 'asc' }],
  });

  return {
    zone,
    seats: seats.map(seat => ({
      ...seat,
      status: this.calculateSeatStatus(seat.bookings),
      currentBooking: seat.bookings[0] || null,
    })),
  };
}
```

---

### API 3: 创建预约

**端点**: `POST /api/bookings`

**请求体**:
```json
{
  "seatId": "seat-A1",
  "startTime": "2026-01-27T14:00:00Z",
  "duration": 2
}
```

**响应示例**:
```json
{
  "booking": {
    "id": "booking-123",
    "seat": {
      "id": "seat-A1",
      "number": "A1",
      "zone": {
        "name": "1F 综合阅览区"
      }
    },
    "startTime": "2026-01-27T14:00:00Z",
    "endTime": "2026-01-27T16:00:00Z",
    "status": "CONFIRMED",
    "price": 20
  }
}
```

**实现要点**:
```typescript
@Post('bookings')
@UseGuards(JwtAuthGuard)
async createBooking(
  @CurrentUser() user: User,
  @Body() dto: CreateBookingDto,
) {
  // 1. 检查座位是否可用
  const isAvailable = await this.bookingService.checkSeatAvailability(
    dto.seatId,
    dto.startTime,
    dto.duration,
  );

  if (!isAvailable) {
    throw new BadRequestException('该时段座位已被预约');
  }

  // 2. 创建预约
  const booking = await this.prisma.booking.create({
    data: {
      userId: user.id,
      seatId: dto.seatId,
      startTime: new Date(dto.startTime),
      endTime: new Date(new Date(dto.startTime).getTime() + dto.duration * 60 * 60 * 1000),
      status: 'CONFIRMED',
      price: await this.calculatePrice(dto.seatId, dto.duration),
    },
    include: {
      seat: {
        include: {
          zone: true,
        },
      },
    },
  });

  return { booking };
}
```

---

### API 4: 查询我的预约

**端点**: `GET /api/bookings/my`

**查询参数**:
- `status`: 可选，筛选状态（CONFIRMED, CANCELLED, COMPLETED）
- `page`: 页码，默认 1
- `limit`: 每页数量，默认 20

**响应示例**:
```json
{
  "bookings": [
    {
      "id": "booking-123",
      "seat": {
        "number": "A1",
        "zone": {
          "name": "1F 综合阅览区",
          "floor": 1
        }
      },
      "startTime": "2026-01-27T14:00:00Z",
      "endTime": "2026-01-27T16:00:00Z",
      "status": "CONFIRMED",
      "price": 20,
      "canCancel": true
    }
  ],
  "pagination": {
    "total": 15,
    "page": 1,
    "limit": 20,
    "totalPages": 1
  }
}
```

---

### API 5: 取消预约

**端点**: `DELETE /api/bookings/:id`

**响应**:
```json
{
  "message": "预约已取消",
  "refund": 20
}
```

**实现要点**:
```typescript
@Delete('bookings/:id')
@UseGuards(JwtAuthGuard)
async cancelBooking(
  @CurrentUser() user: User,
  @Param('id') bookingId: string,
) {
  const booking = await this.prisma.booking.findUnique({
    where: { id: bookingId },
  });

  // 检查权限
  if (booking.userId !== user.id) {
    throw new ForbiddenException('无权取消此预约');
  }

  // 检查是否可取消（提前1小时）
  const now = new Date();
  const oneHourBefore = new Date(booking.startTime.getTime() - 60 * 60 * 1000);
  
  if (now > oneHourBefore) {
    throw new BadRequestException('预约开始前1小时内无法取消');
  }

  // 取消预约
  await this.prisma.booking.update({
    where: { id: bookingId },
    data: { status: 'CANCELLED' },
  });

  return {
    message: '预约已取消',
    refund: booking.price,
  };
}
```

---

## 🎨 前端企业级 UI 优化

### 优化 1: 首页实时数据展示

**当前问题**: 硬编码的拥挤度数据（82%, 45%, 12%）

**优化方案**: 连接真实API + 流畅加载动画

```vue
<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useZoneStore } from '@zenspace/core/stores';

const zoneStore = useZoneStore();
const zones = ref([]);
const loading = ref(true);

onMounted(async () => {
  try {
    loading.value = true;
    await zoneStore.fetchZones();
    zones.value = zoneStore.zones;
  } catch (error) {
    uni.showToast({
      title: '加载失败，请重试',
      icon: 'none'
    });
  } finally {
    // 延迟隐藏加载，让动画更流畅
    setTimeout(() => {
      loading.value = false;
    }, 300);
  }
});
</script>

<template>
  <!-- 骨架屏加载状态 -->
  <view v-if="loading" class="stats-skeleton">
    <view v-for="i in 3" :key="i" class="skeleton-item">
      <view class="skeleton-label shimmer"></view>
      <view class="skeleton-bar shimmer"></view>
    </view>
  </view>

  <!-- 真实数据（带入场动画） -->
  <view v-else class="stats-card animate-slide-up">
    <view
      v-for="(zone, index) in zones"
      :key="zone.id"
      class="stat-item"
      :style="{ animationDelay: `${index * 100}ms` }"
      @tap="handleZoneClick(zone.id)"
    >
      <view class="flex justify-between items-end">
        <text class="stat-label group-hover:text-primary transition-colors">
          {{ zone.floor }}F {{ zone.name }}
        </text>
        <text class="stat-value">
          {{ zone.occupancyRate }}
          <text class="stat-percent">%</text>
        </text>
      </view>
      
      <!-- 动态渐变色 -->
      <view class="stat-bar">
        <view 
          class="stat-bar-fill"
          :class="getZoneStatusClass(zone.status)"
          :style="{ width: zone.occupancyRate + '%' }"
        ></view>
      </view>

      <!-- 状态徽章 -->
      <view class="mt-2 flex items-center gap-2">
        <view :class="['status-badge', `status-${zone.status.toLowerCase()}`]">
          <view class="status-dot"></view>
          <text class="status-text">{{ getStatusText(zone.status) }}</text>
        </view>
        <text class="text-xs text-gray-400">
          剩余 {{ zone.availableSeats }} 个座位
        </text>
      </view>
    </view>
  </view>
</template>

<style lang="scss" scoped>
// 骨架屏动画
.skeleton-item {
  margin-bottom: 32rpx;
}

.skeleton-label {
  width: 200rpx;
  height: 32rpx;
  border-radius: 8rpx;
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200% 100%;
}

.skeleton-bar {
  width: 100%;
  height: 16rpx;
  margin-top: 16rpx;
  border-radius: 100rpx;
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200% 100%;
}

.shimmer {
  animation: shimmer 1.5s infinite;
}

@keyframes shimmer {
  0% {
    background-position: 200% 0;
  }
  100% {
    background-position: -200% 0;
  }
}

// 入场动画
.animate-slide-up {
  animation: slideUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(40rpx);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

// 状态徽章
.status-badge {
  display: flex;
  align-items: center;
  gap: 8rpx;
  padding: 6rpx 12rpx;
  border-radius: 100rpx;
  font-size: 20rpx;
  font-weight: 500;
}

.status-busy {
  background: rgba(239, 68, 68, 0.1);
  color: #ef4444;
}

.status-moderate {
  background: rgba(251, 191, 36, 0.1);
  color: #f59e0b;
}

.status-available {
  background: rgba(34, 197, 94, 0.1);
  color: #22c55e;
}

.status-dot {
  width: 8rpx;
  height: 8rpx;
  border-radius: 50%;
  background: currentColor;
}
</style>
```

---

### 优化 2: 座位选择页 - 震撼的交互体验

**关键提升**:
1. **实时座位状态** - WebSocket 或轮询更新
2. **平滑的选座动画** - 缩放、阴影、触感反馈
3. **座位详情弹窗** - 精美的 Bottom Sheet
4. **预约确认动效** - 成功动画（Lottie 或 CSS）

```vue
<template>
  <view class="seat-grid">
    <view
      v-for="seat in seats"
      :key="seat.id"
      class="seat-item"
      :class="[
        `seat-${seat.status.toLowerCase()}`,
        { 'seat-selected': isSelected(seat.id) }
      ]"
      @tap="handleSeatClick(seat)"
    >
      <!-- 座位图标 -->
      <view class="seat-icon-wrapper">
        <text 
          class="material-symbols-outlined seat-icon"
          :class="{ 'icon-rotate': isSelected(seat.id) }"
        >
          {{ getSeatIcon(seat.status) }}
        </text>
      </view>

      <!-- 座位号 -->
      <text class="seat-number">{{ seat.number }}</text>

      <!-- 特色标签 -->
      <view v-if="seat.features.includes('窗边')" class="feature-badge">
        <text class="material-symbols-outlined text-xs">wb_twilight</text>
      </view>

      <!-- 选中效果 -->
      <view v-if="isSelected(seat.id)" class="selected-ring"></view>
    </view>
  </view>

  <!-- 座位详情 Bottom Sheet -->
  <view 
    v-if="selectedSeat" 
    class="seat-detail-sheet"
    @tap.self="closeSeatDetail"
  >
    <view class="sheet-content animate-slide-in">
      <!-- 拖动指示器 -->
      <view class="sheet-handle"></view>

      <!-- 座位信息 -->
      <view class="seat-info">
        <view class="flex items-center justify-between mb-4">
          <text class="text-2xl font-bold">座位 {{ selectedSeat.number }}</text>
          <view :class="['seat-status-pill', `status-${selectedSeat.status.toLowerCase()}`]">
            {{ getStatusText(selectedSeat.status) }}
          </view>
        </view>

        <!-- 特色标签 -->
        <view class="flex gap-2 mb-6">
          <view v-for="feature in selectedSeat.features" class="feature-chip">
            <text class="material-symbols-outlined text-sm">check_circle</text>
            <text>{{ feature }}</text>
          </view>
        </view>

        <!-- 当前占用信息 -->
        <view v-if="selectedSeat.currentBooking" class="occupied-info">
          <text class="material-symbols-outlined">schedule</text>
          <text>预计 {{ formatTime(selectedSeat.currentBooking.endTime) }} 可用</text>
        </view>

        <!-- 时段选择 -->
        <view class="time-selector">
          <text class="section-title">选择时段</text>
          <view class="time-slots">
            <view
              v-for="slot in timeSlots"
              :key="slot.value"
              class="time-slot"
              :class="{ 'time-slot-active': selectedTime === slot.value }"
              @tap="selectedTime = slot.value"
            >
              <text>{{ slot.label }}</text>
              <text class="text-xs text-gray-400">¥{{ slot.price }}</text>
            </view>
          </view>
        </view>

        <!-- 确认按钮 -->
        <view 
          class="confirm-btn"
          @tap="handleConfirmBooking"
        >
          <text class="material-symbols-outlined">event_available</text>
          <text>确认预约</text>
        </view>
      </view>
    </view>
  </view>
</template>

<style lang="scss" scoped>
.seat-item {
  position: relative;
  width: 100rpx;
  height: 100rpx;
  border-radius: 24rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  
  &:active {
    transform: scale(0.95);
  }
}

// 可用座位
.seat-available {
  background: linear-gradient(135deg, #d4f4dd, #a7e9af);
  border: 3rpx solid #22c55e;
  box-shadow: 0 4rpx 12rpx rgba(34, 197, 94, 0.2);

  &:active {
    box-shadow: 0 8rpx 24rpx rgba(34, 197, 94, 0.3);
  }
}

// 已占用座位
.seat-occupied {
  background: #e2e8f0;
  border: 3rpx solid #cbd5e1;
  opacity: 0.5;
  cursor: not-allowed;
}

// 已选中座位
.seat-selected {
  background: linear-gradient(135deg, #667eea, #764ba2);
  border: 3rpx solid #667eea;
  box-shadow: 0 8rpx 32rpx rgba(102, 126, 234, 0.4);
  transform: scale(1.05);

  .seat-icon {
    color: white;
  }
}

// 图标旋转动画
.icon-rotate {
  animation: rotate360 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55);
}

@keyframes rotate360 {
  0% {
    transform: rotate(0deg) scale(1);
  }
  50% {
    transform: rotate(180deg) scale(1.2);
  }
  100% {
    transform: rotate(360deg) scale(1);
  }
}

// 选中环
.selected-ring {
  position: absolute;
  inset: -6rpx;
  border-radius: 28rpx;
  border: 3rpx solid #667eea;
  animation: pulse-ring 1.5s infinite;
}

@keyframes pulse-ring {
  0%, 100% {
    opacity: 1;
    transform: scale(1);
  }
  50% {
    opacity: 0.5;
    transform: scale(1.05);
  }
}

// Bottom Sheet
.seat-detail-sheet {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(8rpx);
  z-index: 999;
  display: flex;
  align-items: flex-end;
}

.sheet-content {
  width: 100%;
  max-height: 80vh;
  background: white;
  border-radius: 48rpx 48rpx 0 0;
  padding: 32rpx;
  box-shadow: 0 -8rpx 32rpx rgba(0, 0, 0, 0.1);
}

.animate-slide-in {
  animation: slideIn 0.4s cubic-bezier(0.16, 1, 0.3, 1);
}

@keyframes slideIn {
  from {
    transform: translateY(100%);
  }
  to {
    transform: translateY(0);
  }
}

// 拖动指示器
.sheet-handle {
  width: 80rpx;
  height: 8rpx;
  background: #e5e7eb;
  border-radius: 100rpx;
  margin: 0 auto 32rpx;
}

// 确认按钮
.confirm-btn {
  width: 100%;
  padding: 32rpx;
  background: linear-gradient(135deg, #667eea, #764ba2);
  border-radius: 24rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16rpx;
  color: white;
  font-size: 32rpx;
  font-weight: 600;
  box-shadow: 0 8rpx 24rpx rgba(102, 126, 234, 0.3);
  transition: all 0.3s;

  &:active {
    transform: scale(0.98);
    box-shadow: 0 4rpx 12rpx rgba(102, 126, 234, 0.3);
  }
}
</style>
```

---

### 优化 3: 预约成功动效

```vue
<template>
  <!-- 成功动画遮罩 -->
  <view v-if="showSuccessAnimation" class="success-overlay">
    <view class="success-content">
      <!-- 对勾动画 -->
      <view class="checkmark-circle">
        <svg class="checkmark" viewBox="0 0 52 52">
          <circle class="checkmark-circle-path" cx="26" cy="26" r="25" fill="none"/>
          <path class="checkmark-check" fill="none" d="M14.1 27.2l7.1 7.2 16.7-16.8"/>
        </svg>
      </view>

      <text class="success-title">预约成功！</text>
      <text class="success-desc">请准时前往座位</text>

      <!-- 座位信息卡片 -->
      <view class="booking-card">
        <view class="card-row">
          <text class="card-label">座位</text>
          <text class="card-value">{{ bookingInfo.seatNumber }}</text>
        </view>
        <view class="card-row">
          <text class="card-label">时间</text>
          <text class="card-value">{{ formatTimeRange(bookingInfo) }}</text>
        </view>
      </view>
    </view>
  </view>
</template>

<style lang="scss" scoped>
.success-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.8);
  backdrop-filter: blur(16rpx);
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
  animation: fadeIn 0.3s;
}

.success-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  animation: zoomIn 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55);
}

.checkmark-circle {
  width: 200rpx;
  height: 200rpx;
  margin-bottom: 48rpx;
}

.checkmark {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  display: block;
  stroke-width: 3;
  stroke: #22c55e;
  stroke-miterlimit: 10;
}

.checkmark-circle-path {
  stroke-dasharray: 166;
  stroke-dashoffset: 166;
  animation: stroke 0.6s cubic-bezier(0.65, 0, 0.45, 1) forwards;
}

.checkmark-check {
  transform-origin: 50% 50%;
  stroke-dasharray: 48;
  stroke-dashoffset: 48;
  animation: stroke 0.3s cubic-bezier(0.65, 0, 0.45, 1) 0.8s forwards;
}

@keyframes stroke {
  100% {
    stroke-dashoffset: 0;
  }
}

@keyframes zoomIn {
  from {
    opacity: 0;
    transform: scale(0.3);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

.success-title {
  font-size: 48rpx;
  font-weight: bold;
  color: white;
  margin-bottom: 16rpx;
}

.booking-card {
  width: 600rpx;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(20rpx);
  border-radius: 24rpx;
  padding: 32rpx;
  margin-top: 48rpx;
  border: 1rpx solid rgba(255, 255, 255, 0.2);
}
</style>
```

---

## ✅ 验收标准

### 后端
- [ ] 5个API全部实现并通过测试
- [ ] 区域占用率实时计算准确
- [ ] 预约时段冲突检测正常
- [ ] 基础测试覆盖核心流程（5-10个用例）

### 前端
- [ ] 首页拥挤度数据来自真实API
- [ ] 座位选择页连接真实数据
- [ ] 预约流程完全打通
- [ ] 骨架屏加载流畅
- [ ] 所有交互动画精致（scale、fade、slide）
- [ ] 预约成功动效震撼

### 企业级UI标准
- [ ] **加载状态**: 骨架屏替代loading图标
- [ ] **微交互**: hover、active状态有反馈
- [ ] **流畅动画**: 300-600ms过渡时间
- [ ] **视觉层次**: 阴影、模糊、渐变运用恰当
- [ ] **品牌一致性**: 颜色、字体、圆角统一
- [ ] **惊喜时刻**: 成功动效让人眼前一亮

---

## 📊 时间规划

### 后端（6-8小时）
- Day 1 上午：区域和座位API（3h）
- Day 1 下午：预约CRUD API（3h）
- Day 2 上午：测试和优化（2h）

### 前端（6-8小时）
- Day 2 下午：连接区域API + 骨架屏（3h）
- Day 3 上午：座位选择交互优化（3h）
- Day 3 下午：预约流程打通 + 成功动效（2h）

**总计**: 12-16小时（2-3工作日）

---

## 🎨 企业级UI核心原则

### 1. 流畅性（Fluidity）
- 所有动画使用 `cubic-bezier` 缓动
- 过渡时间 300-600ms
- 60fps 流畅度

### 2. 反馈性（Feedback）
- 触摸有触感反馈（scale 0.95-1.05）
- 操作有视觉反馈（颜色、阴影变化）
- 状态有明确提示（loading、success、error）

### 3. 精致感（Refinement）
- 圆角统一（24rpx、32rpx、48rpx）
- 阴影层次分明（4rpx、8rpx、16rpx、32rpx）
- 渐变色优雅（不超过3个颜色）

### 4. 惊喜感（Delight）
- 预约成功：对勾动画 + 烟花效果
- 座位选中：旋转 + 缩放 + 脉冲环
- 页面切换：滑动 + 淡入淡出

---

**创建人**: Architect (Antigravity)  
**创建时间**: 2026-01-26  
**目标**: 打通前后端 + 呈现震撼的企业级 UI
