# Claude Code 多模型协作指南

## 概述

Claude Code VSCode 插件原生支持**多模型选择**和**多 Agent 窗口**，无需额外配置即可实现双 AI 协作。

## 快速开始

### 方式 1: 切换模型

在 Claude Code 面板中，通过模型选择器直接切换：

```
Claude Opus 4.5  →  架构设计、代码审核
GLM-4.7          →  代码实现、测试编写
```

### 方式 2: 开启多个 Agent 窗口

1. **打开新的 Agent 窗口**
   - 使用快捷键（取决于插件配置）
   - 或通过 VSCode 命令面板 (`Ctrl+Shift+P`) 搜索 "Claude Code"

2. **为每个窗口配置不同模型**
   - 窗口 A: 选择 **Claude Opus 4.5** (Architect)
   - 窗口 B: 选择 **GLM-4.7** (Builder)

## 工作流示例

### 典型开发流程

```mermaid
graph LR
    A[需求] -->|窗口 A: Opus| B[生成 PRD]
    B -->|窗口 A: Opus| C[设计 UI 规范]
    C -->|窗口 A: Opus| D[分解任务]
    D -->|窗口 B: GLM| E[实现代码 + 测试]
    E -->|窗口 A: Opus| F[审核代码]
    F -->|通过| G[提交]
```

### 角色分配

| 窗口 | 模型 | 职责 | 命令 |
|:---|:---|:---|:---|
| **A** | Claude Opus 4.5 | 架构设计、契约制定、审核 | `/prd`, `/ui`, `/plan`, `/review` |
| **B** | GLM-4.7 | 代码实现、测试编写、TDD | `/dev`, 测试运行 |

## 实用技巧

### 1. 窗口命名

为便于区分，建议：
- 窗口 A 标题备注: `[Architect-Opus]`
- 窗口 B 标题备注: `[Builder-GLM]`

### 2. 上下文同步

- 使用项目的 `.claude/tickets/` 目录传递任务
- Architect 创建 Ticket → Builder 领取实现 → Architect 审核

### 3. 避免冲突

- 不要同时在两个窗口编辑同一文件
- 使用 Git 分支隔离不同窗口的工作

## 快捷命令参考

```
/prd     → 生成产品规格文档 (Architect)
/ui      → 生成 UI 设计规范 (Architect)
/plan    → 分解任务为 Ticket (Architect)
/dev     → 领取任务进行开发 (Builder)
/review  → 审核代码质量 (Architect)
```

## 注意事项

1. **模型选择**: 模型选择器在 Claude Code 面板的顶部或设置中
2. **API 配置**: 需要同时配置 Anthropic 和 GLM 的 API Key
3. **费用控制**: Opus 成本较高，建议仅在需要时使用

---

**更新日期**: 2026-01-24
**适用版本**: Claude Code VSCode Extension (Latest)
