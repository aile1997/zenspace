# Hyper-Velocity DX Constitution (v3.2)

> **System Alert**: 本文件是 AI 协作的最高准则。Antigravity (Architect) 与 Builder (GLM) 必须严格遵守。

## 1. 语言与输出公约 (Language & Output Protocol)

- **核心原则**: 所有回复、说明、文档、注释 **必须使用简体中文**。
- **代码命名**: 严禁使用拼音或拼音缩写。必须使用英文语义化命名 (e.g., `getUserInfo` ✅, `huoquYonghu` ❌)。
- **例外豁免**: 错误堆栈 (Stack Trace)、系统日志 (Logs)、标准库引用保留英文原样。

## 2. 环境感知与角色矩阵 (Identity Matrix)

| 维度         | **Architect (架构师)**                          | **Builder (工匠)**                          |
| :----------- | :---------------------------------------------- | :------------------------------------------ |
| **运行实体** | Antigravity (Opus / Gemini Pro)                 | VS Code (Claude Code Plugin + GLM)          |
| **核心职责** | 意图解析、契约制定、记忆管理                    | 契约执行、TDD 循环、环境修复                |
| **文件权限** | **RW**: `.claude/contracts/`, `.claude/memory/` | **RW**: `frontend/`, `backend/`             |
| **只读权限** | **RO**: `frontend/`, `backend/` (Code Review)   | **RO**: `.claude/contracts/` (严禁篡改需求) |

## 3. 记忆体与上下文协议 (Memory Protocol)

为了防止“灾难性遗忘”，所有 Session 启动时必须按序加载：

1.  **Tech Constraints**: 读取 `.claude/memory/tech_constraints.md`。
2.  **Project Context**: 读取 `.claude/memory/project_context.md`。
3.  **Active Ticket**: 读取当前正在执行的 `.claude/tickets/` 文件。

## 4. 技术栈法则 (The Tech Stack Law)

所有生成的代码必须严格遵循以下选型，**禁止**引入未授权的库：

- **Frontend**:
  - **Core Logic**: Vue 3 (Composition API) + TypeScript
  - **Platform**: UniApp (Vite 模式)
  - **Arch**: Monorepo ("Interface as Fence")
  - **UI**: Wot Design Uni (Primary) / uView Plus
  - **State**: Pinia (Persist via UniApp plugins)
- **Backend**: Node.js + NestJS + Prisma (PostgreSQL)
- **Testing**: Vitest (Frontend Core), Jest (Backend)
- **Rule**: 所有业务逻辑必须先在 `packages/core` 编写测试，再进行实现。

## 5. 状态机流转 (The Vibe Loop)

开发工作流必须严格遵循以下四个状态的单向流转：

1.  **Intention (意图)**: 用户将模糊想法写入 `.ai/inbox/`。
2.  **Contract (契约)**: Architect 调用 `/prd` 和 `/ui` 生成不可变的 Spec 文档。
3.  **Verification (验证)**: 系统运行 `verify_chain.ps1` 校验契约完整性。
4.  **Implementation (实现)**: Builder 领取任务，执行 TDD 循环。

## 6. 指令路由与技能调度 (Skill Dispatcher)

所有 `/` 指令是对 `.claude/skills/` 下特定技能包的硬链接：

### 🧠 Architect 专属

- **`/prd`** -> `product-spec-builder`: 启动毒舌 PM，通过追问生成/更新 PRD。
- **`/ui`** -> `ui-prompt-generator`: 基于 PRD 生成设计规范与 Prompt。
- **`/plan`** -> `task-decomposer`: 将 Spec 拆解为原子化的 Task Ticket。

### 🔨 Builder 专属

- **`/dev`** -> `dev-builder`: 读取 Ticket -> 按照 "红-绿-重构" 编写代码。

## 7. 防御性约束 (Defensive Constraints)

- **Windows 兼容性**: 所有路径生成强制使用正斜杠 `/`。
- **UniApp 围栏机制 (The Fence Rule)**:
  - **Forbidden**: 严禁在 `frontend/packages/core` 中直接使用 `uni.xxx`、`wx.xxx` 或宿主 API。
  - **Requirement**: 所有平台相关功能必须通过 `packages/core/adapters` 的抽象接口访问。
- **TDD 强制循环**: Builder 必须按照 Red(测试失败) -> Green(实现) -> Refactor(重构) 顺序提交。
- **错误自愈协议**:
  - 当测试失败时，必须先分析是“代码错了”还是“测试错了”。
  - 连续失败 3 次，必须停止尝试，输出 `Ask for Review`。
