# ZenSpace 智能自习室 - 项目核心上下文

## 1. 业务愿景

打造一个沉浸式的智能自习室预约平台。用户通过 App 实时查看座位状态、预约时段、到店签到。

## 2. 架构核心 (TDR)

- **Monorepo**: 所有前端逻辑在 `frontend/` 目录下，分为 `core` (逻辑) 和 `ui` (视图)。
- **Interface as Fence (接口即围栏)**: `packages/core` 是 100% 纯 TypeScript 环境，禁止调用 `uni.xxx`。
- **Adapters Pattern**: 平台相关 API (存储、网络) 必须通过 `adapters` 接口注入，实现核心逻辑与多端平台的彻底解耦。

## 3. 开发流程 (TDD)

所有 Builder 执行任务必须遵循：`编写测试 (Red)` -> `逻辑实现 (Green)` -> `重构/UI绑定 (Refactor)`。

## 4. 当前目标

完成 MVP 版本，目前首要任务是：**用户认证逻辑层开发**。
