# Ticket-001: 核心业务逻辑包 (Core Logic Layer)

## 1. 任务描述

在 `packages/core` 层实现 ZenSpace 的核心业务逻辑体系，确保逻辑与 UniApp 渲染层彻底解耦。

## 2. 涵盖模块

本工票要求一次性交付以下逻辑组合：

1. **认证模块 (Auth)**: 登录状态、用户资料、Token 刷新。
2. **场景预览 (Zone & Seat)**: 区域列表获取、座位网格状态查询。
3. **预约引擎 (Booking)**: 提交预约、预约状态流转逻辑。

## 3. 核心契约 (接口围栏)

- **State Store**: 使用 Pinia 分模块管理 `user`, `booking`, `system` 状态。
- **Adapter Logic**: 所有的 I/O 操作必须通过 `adapters/` 接口进行。
- **Composable Export**: 每个模块暴露标准化的 `useXxx` Hook。

## 4. 验收标准 (DoD) - 回溯测试要求

1. [ ] **补齐测试对账**: 为已编写的 `useAuth`, `useBooking`, `useSeat`, `useZone` 分别创建 `.spec.ts` 文件。
2. [ ] **围栏自校验**: 运行 `pnpm --filter @zenspace/core test`。
3. [ ] **零污染断言**: 逻辑层中严禁出现 `uni.` 全局变量。

## 5. 执行指令

> /dev 执行此任务。既然你已完成了代码大纲，请立即转入 "回溯 TDD 模式"：补齐测试 -> 验证逻辑 -> 提交。
