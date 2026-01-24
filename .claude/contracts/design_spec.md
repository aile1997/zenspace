# UI 设计规范与契约

> **来源**: 基于 PRD v1.0.0 | **状态**: 待开发

## 1. 全局设计系统 (Global Design System)

- **配色方案 (Tailwind)**:
  - `primary`: `indigo-600` (品牌色：禅意与科技)
  - `primary-foreground`: `white`
  - `secondary`: `slate-100`
  - `background`: `slate-50`
  - `surface`: `white`
  - `text-primary`: `slate-900`
  - `text-secondary`: `slate-500`
  - `accent`: `teal-500` (成功/可用)
  - `destructive`: `rose-500` (占用/错误)
- **字体排版**:
  - 标题: `Inter` (无衬线), 字重: 600/700
  - 正文: `Inter` (无衬线), 字重: 400/500
  - 等宽字体: `JetBrains Mono` (用于座位标签)
- **圆角**: `1rem` (卡片使用 Rounded-2xl), `0.5rem` (按钮使用)
- **阴影**: 柔和、弥散阴影 (`shadow-lg`, `shadow-slate-200/50`)

## 2. 页面/组件契约 (Component Contracts)

### 组件: `ZoneCard` (区域卡片)

**职责**: 展示自习室区域卡片，包含实时拥挤度、设施标签和图片。用于首页或预约页列表。

#### A. 视觉结构

- **布局**: 垂直卡片布局 (封面图在上，内容在下)。
- **图片**: 宽高比 16:9，带有渐变叠加层以增强文字可读性。
- **徽章**: 左上角显示楼层 (例如 "2F")，右上角显示拥挤度状态 (例如 "82% 拥挤")。
- **底部**: 区域名称、标签列表 (Tags)、每小时价格。

#### B. 技术接口 (TypeScript Interface)

```typescript
interface ZoneCardProps {
  zone: {
    id: string;
    name: string; // 例如 "静音研讨区"
    floor: string; // 例如 "2F"
    imageUrl: string;
    tags: string[]; // 例如 ["绝对安静", "独立电源"]
    hourlyPrice: number;
    occupancy: number; // 0-100 百分比
    capacity: number;
    availableSeats: number;
  };
  onClick?: (zoneId: string) => void;
  isLoading?: boolean;
}
```

#### C. 交互状态

- **加载中 (Loading)**: 显示封面图骨架屏 + 标题骨架屏。
- **拥挤 (Crowded)**: 当 `occupancy > 80` 时，进度条/徽章显示红色 (`destructive`)。
- **舒适 (Comfort)**: 当 `occupancy < 50` 时，徽章显示绿色 (`accent`)。
- **悬停 (Hover)**: 桌面端悬停时图片轻微放大 (`scale-105`)，阴影加深。

---

### 组件: `SeatMap` (座位图)

**职责**: 核心交互组件，展示座位分布网格，支持选座。

#### A. 视觉结构

- **布局**: 使用 CSS Grid / Flex 布局模拟物理空间。
- **视觉效果**:
  - 窗户/墙壁指示器。
  - 座位图示：区分 "窗边 (Window)", "标准 (Standard)", "卡座 (Booth)"。
  - 状态颜色：
    - 可选 (Available): `white` (边框 `slate-200`)
    - 已占用 (Occupied): `slate-100` (文字 `slate-300`, 禁用鼠标指针)
    - 已选中 (Selected): `primary` (indigo-600, 白色文字, 发光阴影)

#### B. 技术接口

```typescript
interface Seat {
  id: string;
  label: string; // 例如 "A1"
  type: "window" | "standard" | "booth";
  status: "available" | "occupied" | "maintenance" | "locked";
  x: number; // 网格列
  y: number; // 网格行
}

interface SeatMapProps {
  seats: Seat[];
  selectedSeatId?: string | null;
  onSeatSelect: (seatId: string) => void;
  isLoading?: boolean;
}
```

#### C. 交互状态

- **选择 (Selection)**: 点击可选座位 -> 切换选中状态，触发 `onSelect`，同时提供微触感反馈 (Haptic)。
- **已占用 (Occupied)**: 点击已占用座位 -> 无效，显示提示 (Tooltip) "当前已占用"。
- **缩放 (Zoom)**: 支持双指缩放 (移动端) 或 拖拽 (Canvas/HTML)。

---

### 组件: `StatsCard` (统计卡片)

**职责**: 展示用户学习时长、积分等关键指标。

#### A. 视觉结构

- **风格**: 玻璃拟态 (Glassmorphism) 或 纯白卡片。
- **内容**: 图标 (左) + 数值 (大) + 标签 (小) + 趋势 (例如 "+12%")。

#### B. 技术接口

```typescript
interface StatsCardProps {
  icon: string; // lucide 图标名称
  label: string;
  value: string | number;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  variant?: "primary" | "surface"; // Primary 为深色背景高亮卡片
}
```

---

### 组件: `BookingModal` (预约弹窗)

**职责**: 确认预约信息的弹窗，包含时间选择和支付确认。

#### A. 视觉结构

- **类型**: 底部抽屉 (Mobile) / 对话框 (Desktop)。
- **步骤**:
  1. 确认座位与区域
  2. 选择时段 (时间选择器)
  3. 支付详情 (价格明细)
  4. "滑动支付" 或 "确认按钮"

#### B. 技术接口

```typescript
interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  zoneName: string;
  seatLabel: string;
  hourlyPrice: number;
  onConfirm: (startTime: string, endTime: string) => Promise<void>;
  isProcessing: boolean;
}
```

## 3. 生成 Prompt (视觉验证)

### Prompt 1: 移动端首页 (仪表盘)

```
使用 Vue 3、TailwindCSS 和 uv-ui 风格为 ZenSpace App 创建一个针对移动端优化的“首页屏幕”。
上下文：
- 顶部：用户问候语、头像、“2 级学者”徽章。
- 主部分：水平滑动的“StatsCard”卡片（学习时长、积分）。
- 内容区：垂直排列的“ZoneCard”列表。每个卡片显示一个自习区域（静音区、协作区），配有精美的 Unsplash 封面图、拥挤度进度条和标签。
- 底部：固定的标签栏（首页、预约、个人中心）。
风格：简洁、留白多、使用 Indigo-600 作为主色调，圆角卡片。阴影应微妙。
```

### Prompt 2: 选座界面

```
为移动端视图创建一个 “SeatSelection” 组件。
上下文：
- 顶部：返回按钮、区域标题 “2F 静音区”、日期选择条。
- 中间：一个可滚动的容器，显示 “SeatMap”。
- 座位视觉：使用圆角正方形代表座位。
  - 可选：白色背景，slate-200 边框。
  - 已占用：Slate-100 背景，禁用状态。
  - 已选中：Indigo-600 背景，白色文字，大阴影，scale-110 缩放动画。
- 底部：固定页脚显示 “已选：A1”、“总计：¥15” 和一个大的 “立即预约” 按钮。
风格：高度交互、过渡平滑、营造 “禅意” 氛围。
```

### Prompt 3: 用户资料与成就

```
创建一个 “用户资料” 页面。
上下文：
- 顶部：居中的大头像、姓名、VIP 徽章（金色渐变）。
- 统计网格：2x2 网格显示 “总时长”、“连续天数”、“积分”、“排名”。
- 成就部分：已解锁六边形徽章的水平滚动列表（例如 “早起鸟”、“午夜猫”）。
- 菜单列表：“我的预约”、“钱包”、“设置”（使用向右箭头图标）。
风格：高级感、顶部使用玻璃拟态效果、柔和渐变。
```
