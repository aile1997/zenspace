# 前端优化计划（保守方案）

**日期**: 2026-01-30
**策略**: 最小化改动，确保流程畅通

---

## 当前状态分析

### 已完成 ✅
- 后端 5 个预约 API（100%）
- 数据库 schema 和 seed 数据
- 前端 zone store 和 booking store
- 首页连接真实 API（带骨架屏）

### 待优化 🔄
1. **选座页** - 目前使用模拟数据，需连接真实 API
2. **我的预约页** - 目前使用模拟数据，需连接真实 API
3. **类型兼容性** - Booking 类型在不同文件中存在差异

---

## 优化方案（3步走）

### Step 1: 数据适配层（最安全）✅ 推荐
**目标**: 不改现有 UI，只添加数据转换函数
**改动**: 最小化，仅在 store 层添加适配函数

**操作**:
```typescript
// 在 booking store 中添加适配函数
const adaptBookingToLegacyFormat = (booking: ApiBooking) => {
  return {
    ...booking,
    zoneName: booking.seat.zone.name,
    zoneFloor: booking.seat.zone.floor,
    seatLabel: booking.seat.label,
  };
};
```

**优势**:
- 不破坏现有 UI
- 向后兼容
- 易于测试

### Step 2: 连接真实 API
**目标**: 用真实数据替换模拟数据

**"我的预约"页面**:
```diff
onMounted(async () => {
-  localBookings.value = mockBookings;
+  try {
+    const result = await bookingStore.fetchBookings();
+    localBookings.value = result.bookings.map(adaptBooking);
+  } catch (error) {
+    // 降级到模拟数据
+    localBookings.value = mockBookings;
+  }
});
```

**"选座"页面**:
```diff
onMounted(async () => {
-  seats.value = generateMockSeats();
+  const zoneId = getUrlParam('zone') || 'zone-1f';
+  await zoneStore.fetchZoneSeats(zoneId, todayDate);
+  seats.value = zoneStore.seats;
});
```

### Step 3: 测试完整流程
**用户旅程**:
1. 登录 → 首页（查看区域占用率）✅
2. 首页 → 点击区域 → 选座页（查看座位）🔄
3. 选座页 → 选择座位 → 预约确认 → 提交 🔄
4. 跳转到我的预约 → 查看列表 🔄
5. 我的预约 → 取消预约 🔄

---

## 风险控制

### 降级策略
所有 API 调用都包含 try-catch，失败时使用模拟数据：
```typescript
try {
  const data = await api.fetch();
  return data;
} catch (error) {
  console.warn('API failed, using mock data');
  return mockData;
}
```

### 类型安全
使用类型断言和运行时检查：
```typescript
const booking = response.booking as LegacyBooking;
if (!booking.seatLabel && booking.seat?.label) {
  booking.seatLabel = booking.seat.label;
}
```

---

## 实施步骤

1. ✅ 创建本文档
2. 🔄 在 booking store 添加数据适配函数
3. 🔄 优化"我的预约"页面（连接真实 API）
4. 🔄 优化"选座"页面（连接真实 API）
5. 🔄 端到端测试
6. 🔄 提交代码

---

## 预期结果

- **代码改动**: < 200 行
- **破坏性更新**: 0
- **新增文件**: 0
- **修改文件**: 2-3 个
- **测试通过**: 完整用户旅程畅通

---

**原则**: 如果不确定，就不改！保持现有 UI 完全不动。
