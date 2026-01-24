# 📚 ZenSpace 智能自习室 - GitHub 工作流与开发规范

> **ZenSpace** 是一款面向城市白领、学生群体的智能自习室预约平台，提供座位实时查询、在线预约、智能签到、学习数据追踪等服务。

---

## 📖 目录

- [项目概览](#-项目概览)
- [核心特性](#-核心特性)
- [技术栈](#-技术栈)
- [架构设计](#-架构设计)
- [快速开始](#-快速开始)
- [开发规范](#-开发规范)
- [GitHub 工作流](#-github-工作流)
- [Git Hooks](#-git-hooks)
- [测试策略](#-测试策略)
- [提交规范](#-提交规范)
- [故障排查](#-故障排查)
- [相关文档](#-相关文档)

---

## 🎯 项目概览

### 项目定位

**一键预约 → 扫码入座 → 专注学习 → 积分激励**

ZenSpace 通过移动端 App 为用户提供沉浸式学习体验，解决传统自习室痛点：

- ❌ 到店才知道没座位
- ❌ 找座位浪费时间
- ❌ 无法提前规划学习时间
- ❌ 缺乏学习数据追踪

✅ **ZenSpace 解决方案**：实时座位查看 + 精准预约 + 智能签到 + 数据可视化

### 项目阶段

**当前状态**: MVP 版本开发中
**最新版本**: v0.1.0 (初始化阶段)
**里程碑**: M1 - 核心预约流程（4 周）

---

## ✨ 核心特性

### P0 功能（MVP）

| 功能模块 | 说明 | 状态 |
|:--------|:-----|:--:|
| **用户认证** | 手机验证码/微信登录/账号密码 | 🚧 开发中 |
| **实时座位状态** | WebSocket 实时座位网格展示 | 📋 规划中 |
| **智能预约** | 日期/区域/座位/时段选择 + 支付 | 🚧 开发中 |
| **我的预约** | 预约管理、签到签退、智能退款 | 🚧 开发中 |
| **会员体系** | 普通用户 / VIP 等级与权益 | 📋 规划中 |

### P1 功能（增长版）

- 📊 学习统计（时长、图表、排名）
- 🎁 积分商城（积分获取与兑换）
- 🏆 成就系统与徽章解锁
- 📍 门店地图与楼层导航
- 🔔 消息中心（系统/预约/成就/促销通知）

---

## 🛠️ 技术栈

### 前端技术栈

```
Vue 3 (Composition API)
  └── UniApp (Vite 模式) - 多端发布（H5/小程序/App）
      ├── TypeScript - 类型安全
      ├── Pinia - 状态管理
      ├── Wot Design Uni - UI 组件库
      ├── Vite - 极速构建
      └── Vitest - 单元测试
```

**核心依赖**:
- `vue@^3.4.0` - Vue 3 框架
- `@dcloudio/uni-app@3.0.0-alpha` - UniApp 核心
- `pinia@^2.1.7` - 状态管理
- `wot-design-uni@^1.3.1` - UI 组件库
- `vitest@^1.2.1` - 测试框架

### 后端技术栈

```
Node.js 20.x LTS
  └── NestJS 11.x - 渐进式服务端框架
      ├── TypeScript - 类型安全
      ├── Prisma - ORM 数据库管理
      ├── PostgreSQL - 关系型数据库
      ├── Redis + BullMQ - 缓存与任务队列
      ├── Socket.IO - 实时通信
      ├── JWT + Passport - 认证授权
      └── Jest - 单元与集成测试
```

**核心依赖**:
- `@nestjs/core@^11.0.1` - NestJS 核心
- `@prisma/client@^7.3.0` - Prisma ORM
- `passport-jwt@^4.0.1` - JWT 认证
- `ioredis@^5.9.2` - Redis 客户端
- `bcrypt@^6.0.0` - 密码加密

---

## 🏗️ 架构设计

### Monorepo 架构

项目采用 **完全的 Monorepo 架构**，核心原则为 **"接口即围栏" (Interface as Fence)**：

```
zenspace/
├── frontend/                          # 前端 Monorepo
│   ├── packages/
│   │   ├── core/                      # 🧠 业务逻辑层（100% 纯 TypeScript）
│   │   │   ├── src/
│   │   │   │   ├── types/             # 类型定义
│   │   │   │   ├── stores/            # Pinia 状态管理
│   │   │   │   ├── composables/       # 业务 Hook (useAuth, useBooking, etc.)
│   │   │   │   ├── adapters/          # 平台接口抽象 (IHttp, IStorage, ILocation)
│   │   │   │   ├── api/               # API 调用封装
│   │   │   │   └── utils/             # 工具函数
│   │   │   └── tests/                 # 单元测试（Vitest）
│   │   │
│   │   └── ui/                        # 🎨 视图层（UniApp + Vue 3）
│   │       ├── src/
│   │       │   ├── pages/             # 页面组件
│   │       │   └── utils/adapters.ts  # 平台适配器实现
│   │       └── pages.json             # UniApp 页面配置
│   │
│   └── package.json                   # Monorepo 根配置
│
├── backend/                            # 后端服务
│   ├── src/                           # NestJS 源码
│   ├── prisma/                        # 数据库模型
│   └── package.json
│
└── .claude/                            # AI 协作契约系统
    ├── contracts/                     # PRD 与设计规范
    ├── memory/                        # 项目记忆库
    └── tickets/                       # 任务工票
```

### 核心架构原则

#### 1️⃣ **接口围栏规则** (Interface as Fence)

**核心思想**: `packages/core` 是 100% 纯 TypeScript 环境，零平台污染

❌ **禁止**在 Core 层使用：
```typescript
uni.request()        // UniApp API
wx.login()          // 微信小程序 API
window.location     // 浏览器 API
navigator.geolocation // 浏览器地理位置 API
```

✅ **正确做法**：通过适配器接口抽象
```typescript
// core/src/adapters/IHttp.ts
export interface IHttp {
  request<T>(config: HttpConfig): Promise<T>
}

// core/src/composables/useAuth.ts
export function useAuth(http: IHttp) {
  // 使用 http.request() 而非 uni.request()
}

// ui/src/utils/adapters.ts
export const httpAdapter: IHttp = {
  request: (config) => uni.request(config)  // 在这里才使用平台 API
}
```

**收益**:
- ✅ Core 层可在 Node.js 环境运行测试
- ✅ 逻辑复用到其他平台（React Native、Electron 等）
- ✅ 单元测试无需模拟平台环境

#### 2️⃣ **TDD 强制流程**

所有业务逻辑必须遵循 **红 → 绿 → 重构** 循环：

```bash
# 1. 红 (Red) - 编写失败的测试
pnpm --filter @zenspace/core test:watch

# 2. 绿 (Green) - 实现代码使测试通过
# 编写最小实现

# 3. 重构 (Refactor) - 改进代码质量
# 保持测试通过的前提下优化代码
```

**规则**:
- 所有 `composables/` 必须有对应的 `.spec.ts` 文件
- 测试覆盖率关键路径 ≥ 80%
- 必须包含成功路径和失败路径

#### 3️⃣ **类型共享**

前后端共享 TypeScript 类型定义：

```typescript
// 前端 core/src/types/booking.ts
export interface Booking {
  id: string
  userId: string
  seatId: string
  status: BookingStatus
}

// 后端可复用相同类型（未来可提取到 @zenspace/types 包）
```

---

## 🚀 快速开始

### 环境要求

| 工具 | 版本要求 |
|:-----|:--------|
| Node.js | ≥ 20.x LTS |
| pnpm | ≥ 8.x |
| PostgreSQL | ≥ 16.x |
| Redis | ≥ 7.x |
| Git | ≥ 2.30 |

### 克隆仓库

```bash
git clone https://github.com/your-org/zenspace.git
cd zenspace
```

### 安装依赖

```bash
# 安装前端依赖
cd frontend
pnpm install

# 安装后端依赖
cd ../backend
pnpm install
```

### 配置环境变量

```bash
# 后端 .env
cp backend/.env.example backend/.env
# 编辑 .env 配置数据库连接等
```

### 初始化数据库

```bash
cd backend
pnpm prisma migrate dev
pnpm prisma db seed
```

### 启动项目

```bash
# 启动后端服务
cd backend
pnpm run start:dev  # http://localhost:3000

# 启动前端开发服务器
cd frontend/packages/ui
pnpm run dev:h5     # http://localhost:5173
```

### 运行测试

```bash
# 前端核心层测试
cd frontend/packages/core
pnpm run test

# 后端测试
cd backend
pnpm run test
```

---

## 📐 开发规范

### 代码规范

#### 命名规范

| 类型 | 规则 | 示例 |
|:-----|:-----|:-----|
| **文件名** | kebab-case | `use-auth.ts`, `booking-modal.vue` |
| **组件名** | PascalCase | `ZoneCard`, `SeatMap` |
| **函数/变量** | camelCase | `getUserInfo`, `isLoggedIn` |
| **常量** | UPPER_SNAKE_CASE | `API_BASE_URL`, `MAX_RETRY_COUNT` |
| **类型/接口** | PascalCase | `User`, `BookingStatus` |

**❌ 严禁使用拼音命名**:
```typescript
// ❌ 错误
const huoquYonghu = () => {}
const yonghuXinxi = {}

// ✅ 正确
const getUserInfo = () => {}
const userInfo = {}
```

#### 注释规范

**原则**: 写 **Why**，不写 **What**

```typescript
// ❌ 错误 - 注释重复了代码
// 获取用户信息
const userInfo = getUserInfo()

// ✅ 正确 - 解释为什么这样做
// 需要提前获取用户信息以验证预约权限
const userInfo = getUserInfo()
```

**所有注释必须使用简体中文**。

### 目录结构规范

#### Core 层（`frontend/packages/core/src/`）

```
core/src/
├── types/              # 类型定义（*.ts）
├── stores/             # Pinia Store（*.ts）
├── composables/        # 业务 Hook（use*.ts）
├── adapters/           # 平台接口抽象（I*.ts）
├── api/                # API 调用封装（*.ts）
└── utils/              # 工具函数（*.ts）
```

#### UI 层（`frontend/packages/ui/src/`）

```
ui/src/
├── pages/              # 页面组件（*.vue）
├── components/         # 公共组件（*.vue）
├── utils/              # 工具函数（adapters.ts 等）
└── static/             # 静态资源
```

### 导入顺序规范

```typescript
// 1. Vue 核心
import { ref, computed } from 'vue'

// 2. 第三方库
import { storeToRefs } from 'pinia'

// 3. 项目内部 - types
import type { User, Booking } from '@/types'

// 4. 项目内部 - stores
import { useUserStore } from '@/stores/user'

// 5. 项目内部 - composables
import { useAuth } from '@/composables/useAuth'

// 6. 项目内部 - utils
import { formatDate } from '@/utils/date'
```

---

## 🔄 GitHub 工作流

本项目配置了完整的 GitHub Actions 工作流，用于自动化测试、代码质量检查和防止误操作。

### 工作流概览

| 工作流 | 文件 | 触发条件 | 功能 |
|:------|:-----|:--------|:-----|
| **测试保护** | `test-protection.yml` | PR 修改 core 层代码 / Push 到 main/develop | 测试文件完整性 + 零污染检查 + 运行测试 |
| **完整 CI** | `ci.yml` | Push 到 main/develop / 创建 PR | 前后端 CI（类型检查、Lint、测试、构建） |

### 1️⃣ 测试保护工作流

**文件**: `.github/workflows/test-protection.yml`

**触发条件**:
- Pull Request 修改了 `frontend/packages/core/tests/**` 或 `frontend/packages/core/src/**`
- 推送到 `main` 或 `develop` 分支

**检查项目**:

✅ **测试文件完整性检查**

确保以下 4 个核心测试文件存在且内容完整：
1. `frontend/packages/core/tests/composables/useAuth.spec.ts`
2. `frontend/packages/core/tests/composables/useBooking.spec.ts`
3. `frontend/packages/core/tests/composables/useSeat.spec.ts`
4. `frontend/packages/core/tests/composables/useZone.spec.ts`

✅ **零污染检查**

扫描 `frontend/packages/core/src/` 目录，确保没有使用以下平台 API：

| 禁用 API | 说明 |
|:---------|:-----|
| `uni.xxx` | UniApp 特定 API |
| `wx.xxx` | 微信小程序 API |
| `my.xxx` | 支付宝小程序 API |
| `swan.xxx` | 百度智能小程序 API |
| `window.xxx` | 浏览器 API |
| `navigator.xxx` | 浏览器导航 API |
| `document.xxx` | DOM API |

✅ **运行核心层测试**

```bash
cd frontend/packages/core
pnpm install
pnpm run test
```

**失败后果**: PR 无法合并

### 2️⃣ 完整 CI 工作流

**文件**: `.github/workflows/ci.yml`

**触发条件**:
- 推送到 `main` 或 `develop` 分支
- 创建 Pull Request

**前端 CI 流程**:

```bash
# 1. 安装依赖
cd frontend
pnpm install

# 2. 类型检查
cd packages/core
pnpm run type-check

# 3. 运行测试
pnpm run test

# 4. 构建检查
cd ../ui
pnpm run build:h5
```

**后端 CI 流程**:

```bash
# 1. 安装依赖
cd backend
pnpm install

# 2. Lint 检查
pnpm run lint

# 3. 类型检查
pnpm run type-check

# 4. 运行测试
pnpm run test

# 5. 构建检查
pnpm run build
```

**失败后果**: PR 无法合并，推送被阻止

---

## 🪝 Git Hooks

本项目使用 [Husky](https://typicode.github.io/husky/) 配置了 Git Hooks，在本地提交/推送时自动运行检查。

### Hook 概览

| Hook | 文件 | 时机 | 功能 |
|:-----|:-----|:-----|:-----|
| **Pre-commit** | `.husky/pre-commit` | `git commit` 之前 | 测试完整性 + 零污染 + 运行测试 |
| **Pre-push** | `.husky/pre-push` | `git push` 之前 | 运行完整测试套件 |
| **Commit-msg** | `.husky/commit-msg` | `git commit` 之后 | 提交消息格式检查 |

### 1️⃣ Pre-commit Hook

**位置**: `.husky/pre-commit`

**检查项目**:

```bash
#!/bin/sh
. "$(dirname "$0")/_/husky.sh"

echo "🔍 Running pre-commit checks..."

# 1. 测试文件完整性检查
echo "📋 Checking test file integrity..."
node scripts/check-test-files.js

# 2. 零污染检查
echo "🚫 Checking for platform API pollution..."
node scripts/check-zero-pollution.js

# 3. 运行核心层测试
echo "🧪 Running core tests..."
cd frontend/packages/core
pnpm run test --run
```

**失败后果**: 提交被阻止

**绕过方法**（不推荐）:
```bash
git commit --no-verify -m "message"
```

### 2️⃣ Pre-push Hook

**位置**: `.husky/pre-push`

**检查项目**:

```bash
#!/bin/sh
. "$(dirname "$0")/_/husky.sh"

echo "🔍 Running pre-push checks..."

# 运行完整测试套件
echo "🧪 Running all tests..."
cd frontend/packages/core
pnpm run test --run
```

**失败后果**: 推送被阻止

### 3️⃣ Commit-msg Hook

**位置**: `.husky/commit-msg`

**检查项目**:

```bash
#!/bin/sh
. "$(dirname "$0")/_/husky.sh"

# 提交消息格式检查（约定式提交规范）
npx --no-install commitlint --edit $1
```

**失败后果**: 提交被阻止

**允许的格式示例**:
```
feat: 添加用户登录功能
fix(auth): 修复验证码验证问题
docs: 更新 README
test: 添加 useAuth 测试用例
chore: 更新依赖版本
```

### 🚀 Hook 初始化设置

#### 自动化设置

```bash
# Windows PowerShell
.\scripts\setup-githooks.sh

# Linux/Mac
./scripts/setup-githooks.sh
```

#### 手动设置

如果自动化脚本无法运行，请按以下步骤手动设置：

```bash
# 1. 安装 husky
pnpm add -D husky

# 2. 初始化 husky
pnpm exec husky install

# 3. 设置钩子执行权限（Linux/Mac）
chmod +x .husky/pre-commit
chmod +x .husky/pre-push
chmod +x .husky/commit-msg

# 4. 配置 package.json prepare 脚本
# 在根 package.json 的 scripts 中添加:
# "prepare": "husky install"
```

---

## 🧪 测试策略

### 测试架构

```
frontend/packages/core/tests/
├── composables/
│   ├── useAuth.spec.ts          # 认证逻辑测试（14 个用例）
│   ├── useBooking.spec.ts       # 预约逻辑测试（17 个用例）
│   ├── useSeat.spec.ts          # 座位查询测试（18 个用例）
│   └── useZone.spec.ts          # 区域查询测试（15 个用例）
└── vitest.config.ts             # Vitest 配置
```

**总计**: 1,558 行测试代码，64 个测试用例

### 必需测试文件

以下测试文件 **必须存在**，否则 CI/CD 和 Git Hooks 将失败：

1. `frontend/packages/core/tests/composables/useAuth.spec.ts`
2. `frontend/packages/core/tests/composables/useBooking.spec.ts`
3. `frontend/packages/core/tests/composables/useSeat.spec.ts`
4. `frontend/packages/core/tests/composables/useZone.spec.ts`

**保护机制**:
- ✅ GitHub Actions 自动检查
- ✅ Pre-commit Hook 本地检查
- ✅ 测试文件内容完整性校验（最小行数要求）

### 本地测试命令

```bash
# 进入 core 目录
cd frontend/packages/core

# 运行所有测试
pnpm run test

# 监听模式（开发时推荐）
pnpm run test:watch

# 生成覆盖率报告
pnpm run test:coverage

# 运行单个测试文件
pnpm run test useAuth.spec.ts
```

### 测试编写规范

#### 测试文件命名

```
src/composables/useAuth.ts
  └── tests/composables/useAuth.spec.ts
```

#### 测试结构

```typescript
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { useAuth } from '@/composables/useAuth'

describe('useAuth', () => {
  // 设置测试环境
  beforeEach(() => {
    // 重置状态、清空 Mock 等
  })

  describe('登录功能', () => {
    it('应该能够使用手机验证码登录', async () => {
      // Arrange - 准备测试数据
      const phone = '13800138000'
      const code = '123456'

      // Act - 执行被测试的功能
      const result = await login(phone, code)

      // Assert - 断言结果
      expect(result.success).toBe(true)
      expect(result.user.phone).toBe(phone)
    })

    it('应该在验证码错误时返回错误信息', async () => {
      // 测试失败路径
      const result = await login('13800138000', 'wrong-code')

      expect(result.success).toBe(false)
      expect(result.error).toBe('验证码错误')
    })
  })

  describe('登出功能', () => {
    // ...更多测试
  })
})
```

#### 测试覆盖要求

| 路径类型 | 覆盖率要求 |
|:--------|:----------|
| **关键业务逻辑** | ≥ 80% |
| **工具函数** | ≥ 70% |
| **类型定义** | 无需测试 |

**必须包含**:
- ✅ 成功路径（Happy Path）
- ✅ 失败路径（Error Path）
- ✅ 边界条件（Edge Cases）

---

## 📝 提交规范

本项目严格遵循 [约定式提交规范](https://www.conventionalcommits.org/zh-hans/)（Conventional Commits）。

### 提交消息格式

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Type 类型

| Type | 说明 | 示例 |
|:-----|:-----|:-----|
| `feat` | 新功能 | `feat(auth): 添加微信登录` |
| `fix` | 修复 Bug | `fix(booking): 修复预约时间计算错误` |
| `docs` | 文档更新 | `docs: 更新 README 安装说明` |
| `style` | 代码格式（不影响代码运行） | `style(core): 统一代码缩进` |
| `refactor` | 重构 | `refactor(seat): 优化座位查询逻辑` |
| `test` | 添加测试 | `test(auth): 添加登出功能测试` |
| `chore` | 构建/工具变动 | `chore: 升级 Vite 到 5.2.0` |
| `perf` | 性能优化 | `perf(booking): 优化预约列表渲染` |
| `ci` | CI 配置 | `ci: 添加测试保护工作流` |
| `build` | 构建系统 | `build: 配置 Monorepo 依赖` |

### Scope 范围

| Scope | 说明 |
|:------|:-----|
| `auth` | 认证模块 |
| `booking` | 预约模块 |
| `seat` | 座位模块 |
| `zone` | 区域模块 |
| `core` | 核心逻辑层 |
| `ui` | UI 视图层 |
| `backend` | 后端服务 |

### Subject 主题

**规则**:
- ✅ 简洁描述做了什么
- ✅ 不超过 50 个字符
- ✅ 使用简体中文
- ✅ 不要以句号结尾
- ✅ 使用祈使句（"添加"而非"添加了"）

### 提交消息示例

#### 简单提交

```bash
git commit -m "feat(auth): 添加手机验证码登录"
```

#### 完整提交

```bash
git commit -m "feat(auth): 添加微信登录功能

- 接入微信开放平台 SDK
- 实现微信授权回调处理
- 添加微信用户信息绑定逻辑
- 更新登录页面 UI 支持微信登录按钮

Closes #123"
```

#### Breaking Change

```bash
git commit -m "feat(api): 更新预约接口参数格式

BREAKING CHANGE: 预约接口的 startTime 和 endTime 字段
从 ISO 字符串改为 Unix 时间戳。客户端需要更新代码适配新格式。

Migration Guide:
- 旧格式: startTime: '2024-01-01T09:00:00Z'
- 新格式: startTime: 1704096000

Closes #456"
```

### 提交工作流

#### 标准开发流程

```bash
# 1. 拉取最新代码
git pull origin develop

# 2. 创建功能分支
git checkout -b feat/add-wechat-login

# 3. 进行开发...

# 4. 添加变更到暂存区
git add .

# 5. 提交（会自动触发 pre-commit hook）
git commit -m "feat(auth): 添加微信登录功能"

# 6. 推送分支（会自动触发 pre-push hook）
git push origin feat/add-wechat-login

# 7. 在 GitHub 上创建 Pull Request
```

#### 修改最后一次提交

```bash
# 修改提交消息
git commit --amend -m "feat(auth): 添加微信登录功能"

# 添加遗漏的文件到上次提交
git add forgotten-file.ts
git commit --amend --no-edit
```

### Commitlint 配置

项目使用 `@commitlint/config-conventional` 配置，详见 `commitlint.config.js`。

---

## 🐛 故障排查

### Pre-commit Hook 失败

#### 问题 1: 测试文件缺失

**错误信息**:
```
❌ 错误: 测试文件缺失: frontend/packages/core/tests/composables/useAuth.spec.ts
```

**解决方案**:
1. 检查测试文件是否被误删
2. 如果是新功能，请先编写测试文件
3. 恢复测试文件后重新提交

```bash
# 恢复被删除的文件
git checkout HEAD -- frontend/packages/core/tests/composables/useAuth.spec.ts

# 重新提交
git commit -m "feat(auth): 添加新功能"
```

#### 问题 2: Core 层平台 API 污染

**错误信息**:
```
❌ 错误: Core 层发现 uni.request 调用!
文件: frontend/packages/core/src/composables/useAuth.ts:25
```

**解决方案**:

将平台特定 API 移至适配器：

```typescript
// ❌ 错误 - 在 core 层直接使用 uni.request
// frontend/packages/core/src/composables/useAuth.ts
export function useAuth() {
  const login = async (phone: string) => {
    const res = await uni.request({ url: '/api/login', data: { phone } })
  }
}

// ✅ 正确 - 通过适配器接口
// frontend/packages/core/src/composables/useAuth.ts
import type { IHttp } from '@/adapters/IHttp'

export function useAuth(http: IHttp) {
  const login = async (phone: string) => {
    const res = await http.request({ url: '/api/login', data: { phone } })
  }
}

// frontend/packages/ui/src/utils/adapters.ts
import type { IHttp } from '@zenspace/core/adapters/IHttp'

export const httpAdapter: IHttp = {
  request: (config) => uni.request(config)
}
```

#### 问题 3: 测试失败

**错误信息**:
```
❌ FAIL tests/composables/useAuth.spec.ts
  ● useAuth › 登录功能 › 应该能够使用手机验证码登录
    Expected: true
    Received: false
```

**解决方案**:

1. 检查测试代码是否正确
2. 检查业务逻辑实现是否有 Bug
3. 修复代码后重新运行测试

```bash
# 进入 core 目录
cd frontend/packages/core

# 以监听模式运行测试，方便调试
pnpm run test:watch

# 只运行失败的测试
pnpm run test -- useAuth.spec.ts
```

### Commit-msg Hook 失败

**错误信息**:
```
❌ 错误: 提交消息格式不符合约定式提交规范

提交消息: "修复了一个 bug"

应该使用以下格式:
<type>(<scope>): <subject>
```

**解决方案**:

重写提交消息：

```bash
# 修改最后一次提交的消息
git commit --amend -m "fix(booking): 修复预约时间计算错误"
```

### GitHub Actions 失败

#### 查看失败原因

1. 进入 GitHub 仓库页面
2. 点击 **Actions** 标签
3. 选择失败的工作流运行
4. 点击失败的 Job 查看详细日志

#### 常见失败原因

**1. 依赖安装失败**

```
Error: Command failed: pnpm install
```

**解决**: 检查 `package.json` 依赖版本，确保所有依赖可安装

**2. 类型检查失败**

```
Error: Type 'string | undefined' is not assignable to type 'string'
```

**解决**: 修复 TypeScript 类型错误

**3. 测试失败**

```
Tests failed. See above for details.
```

**解决**: 修复测试用例或业务逻辑

**4. 构建失败**

```
Error: Build failed with 1 error
```

**解决**: 检查构建错误日志，修复编译问题

### 绕过 Hooks（不推荐）

```bash
# 绕过所有 hooks 提交（仅在紧急情况下使用）
git commit --no-verify -m "emergency fix"

# 绕过 pre-push hook
git push --no-verify
```

⚠️ **警告**: 绕过 Hooks 会跳过重要的代码质量检查，可能导致 CI 失败。请仅在紧急情况下使用。

---

## 📚 相关文档

### 项目文档

| 文档 | 路径 | 说明 |
|:-----|:-----|:-----|
| **产品需求文档** | `.claude/contracts/prd.md` | 完整的产品需求规格说明 |
| **设计规范** | `.claude/contracts/design_spec.md` | UI 组件契约与设计系统 |
| **技术约束** | `.claude/memory/tech_constraints.md` | 技术栈与架构规则 |
| **项目上下文** | `.claude/memory/project_context.md` | 项目愿景与当前目标 |
| **测试恢复报告** | `TEST_RECOVERY_REPORT.md` | 测试文件恢复和保护措施 |

### 外部资源

- [约定式提交规范](https://www.conventionalcommits.org/zh-hans/)
- [Husky 文档](https://typicode.github.io/husky/)
- [GitHub Actions 文档](https://docs.github.com/cn/actions)
- [Vitest 文档](https://cn.vitest.dev/)
- [Vue 3 文档](https://cn.vuejs.org/)
- [UniApp 文档](https://uniapp.dcloud.net.cn/)
- [NestJS 文档](https://docs.nestjs.com/)
- [Prisma 文档](https://www.prisma.io/docs)

### API 文档

```bash
# 启动后端服务后访问 Swagger API 文档
# http://localhost:3000/api/docs
```

---

## 🤝 贡献指南

### 参与贡献

我们欢迎任何形式的贡献！包括但不限于：

- 🐛 报告 Bug
- 💡 提出新功能建议
- 📝 改进文档
- 🔧 提交代码修复
- ✨ 实现新功能

### 贡献流程

1. **Fork 本仓库**
2. **创建功能分支** (`git checkout -b feat/amazing-feature`)
3. **遵循开发规范进行开发**
4. **编写测试** (必须通过所有测试)
5. **提交变更** (`git commit -m 'feat: 添加某个很棒的功能'`)
6. **推送到分支** (`git push origin feat/amazing-feature`)
7. **创建 Pull Request**

### Pull Request 要求

- ✅ 必须通过所有 CI 检查
- ✅ 必须包含测试用例（新功能/Bug 修复）
- ✅ 必须更新相关文档
- ✅ 提交消息符合约定式提交规范
- ✅ 代码风格符合项目规范

### Code Review

所有 PR 需要至少 1 位维护者审核通过后才能合并。

---

## 📄 许可证

本项目采用 [MIT License](../LICENSE) 许可证。

---

## 💬 联系我们

- **项目主页**: https://github.com/your-org/zenspace
- **Issue 追踪**: https://github.com/your-org/zenspace/issues
- **讨论区**: https://github.com/your-org/zenspace/discussions

---

## 🙏 致谢

感谢所有为本项目做出贡献的开发者！

[![Contributors](https://contrib.rocks/image?repo=your-org/zenspace)](https://github.com/your-org/zenspace/graphs/contributors)

---

**© 2024 ZenSpace Team. Built with ❤️ by developers, for learners.**
