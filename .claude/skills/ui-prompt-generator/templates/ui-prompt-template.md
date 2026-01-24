# UI Design Specification & Contract

> **Source**: Based on PRD v[Version] | **Status**: Ready for Dev

## 1. 全局设计系统 (Global Design System)

- **Color Palette (Tailwind)**:
  - `primary`: `blue-600` (用于主按钮)
  - `background`: `slate-50`
  - `destructive`: `red-500`
- **Typography**: Inter (Sans), JetBrains Mono (Code)
- **Radius**: `0.5rem` (Rounded-md)

## 2. 页面/组件契约 (Component Contracts)

### Component: `[组件名，例如 UserDashboard]`

**Role**: [一句话描述，例如：展示用户核心数据面板]

#### A. 视觉结构 (Visual Structure)

- **Layout**: Grid 布局，移动端单列，桌面端 3 列。
- **Sections**:
  1. Header (包含头像和欢迎语)
  2. Stats Cards (积分、天数)
  3. Recent Activity List

#### B. 技术接口 (TypeScript Interface)

_(Builder Agent 必须实现此接口)_

```typescript
interface [ComponentName]Props {
  user: {
    name: string;
    avatarUrl: string;
    level: number;
  };
  stats: {
    points: number;
    daysActive: number;
  }[];
  isLoading?: boolean; // 必须处理加载态
}
```

#### C. 交互状态 (Interaction States)

(必须在代码中处理以下所有情况)

- Loading: 当 isLoading=true 时，显示 3 个 Skeleton 骨架屏。
- Empty: 当 stats 数组为空时，显示 EmptyState 组件（包含插画和文案）。
- Error: 当 error 有值时，显示红色警告框和“重试”按钮。

## 3. Generative Prompts (Visual Validation) (在写代码前，请复制以下 Prompt 到 v0.dev 生成预览，确认设计符合预期)

Prompt (V0.dev / stitch):

Create a strictly typed React functional component named [ComponentName] using TailwindCSS and Lucide React icons. Use Shadcn/UI card and button components. Implement the interface defined above. The design should be minimalist, referencing Stripe's dashboard style. Handle loading, empty, and error states gracefully.

Prompt (Midjourney):

/imagine prompt: UI design of a [Component Name], clean saas interface, white and blue color scheme, figma style, high fidelity, 4k --v 6.0
