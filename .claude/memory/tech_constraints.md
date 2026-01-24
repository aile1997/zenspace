# 技术硬约束 (Tech Constraints) - UniApp + Vue3 + TDD 架构协议

## 一、 核心技术栈 (Core Stack)

- **前端框架**: UniApp (Vite + Vue 3 + TypeScript)
- **状态管理**: Pinia (配合 UniApp 持久化插件)
- **UI 组件库**: Wot Design Uni (首选) / uView Plus
- **后端架构**: Node.js + NestJS + Prisma (PostgreSQL)
- **开发环境**: VS Code (核心逻辑开发), HBuilderX (仅用于发布/打包)

## 二、 架构模式: "接口即围栏" (Interface as Fence)

项目采用逻辑与视图彻底分离的 **Monorepo** 思想：

- **`/packages/core` (逻辑层)**:
  - **规则**: 100% 纯 TypeScript。严禁出现 `uni.xxx`、`wx.xxx` 或 `window.xxx`。
  - **内容**: 业务逻辑、API 接口定义、Composables、适配器接口 (`adapters/`)。
  - **TDD 强制循环**: 先写测试 (`tests/`) -> 实现逻辑 -> 通过测试。

- **`/packages/ui` (视图层)**:
  - **规则**: 严禁编写复杂业务逻辑或直接调用底层 API (如 `uni.request`)。
  - **内容**: UniApp 页面和组件，仅负责展现数据和触发交互。
  - **调用限制**: 必须通过调用 `core` 层的 Hooks/Interface 来获取数据或执行操作。

## 三、 关键防御与隔离原则

1. **The No-Native Rule**: 核心业务代码必须平台无关。所有平台特定功能需通过适配器注入。
2. **条件编译原则**: 无法隔离的差异优先使用 `#ifdef` / `#ifndef` 处理，严禁运行时频繁判断平台。
3. **样式规范**: 统一使用 `rpx` 以保证多端适配。
4. **Mock 规范**: 单元测试中所有 `uni` API 必须通过 `vi.mock` 或注入 Dummy Adapter 解决。

## 四、 开发操作准则

1. **禁止随意创建顶级目录**: 严格遵循预定义的项目地图结构。
2. **上下文感知**: 每次生成代码前必须检查 `.claude/rules/uniapp-patterns.md`。
3. **拒绝违规请求**: 如果用户要求在 `.vue` 中直接写业务逻辑或底层请求，AI 必须拒绝并引导至 `core` 层实现。
