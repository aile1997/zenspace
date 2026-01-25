# ZenSpace Git 分支工作流

**版本**: v1.0  
**制定时间**: 2026-01-25  
**制定人**: Architect (Antigravity)

---

## 🎯 核心原则

1. **main 分支保护**: main 分支只接受 review 通过的高质量代码
2. **develop 分支开发**: 所有日常开发提交到 develop 分支
3. **feature 分支隔离**: 大功能使用独立的 feature 分支
4. **review 后合并**: Architect review 通过后才能合并到 main
5. **architecture 分支同步**: 架构文档变更同步到 claude/architecture-docs-* 分支

---

## 📊 分支架构

```
main (受保护的生产分支)
  ├── develop (日常开发分支)
  │     ├── feature/auth-api (功能分支)
  │     ├── feature/booking-system (功能分支)
  │     └── feature/ui-polish (功能分支)
  │
  └── claude/architecture-docs-* (Architect 架构分支)
        └── 架构设计、文档、Tickets
```

---

## 🌿 分支说明

### 1. main 分支

**用途**: 生产就绪的稳定代码

**规则**:
- ✅ 只接受来自 `develop` 的 PR 合并
- ✅ 必须通过 Architect review
- ✅ 必须通过所有测试
- ❌ 禁止直接 push（除非紧急修复）
- ❌ 禁止 force push

**提交要求**:
- 代码质量评分 ≥ 4.0/5.0
- 测试覆盖率 ≥ 80%
- 无 P0/P1 级别问题

---

### 2. develop 分支

**用途**: 日常开发的主分支

**规则**:
- ✅ Builder 的主要工作分支
- ✅ 可以直接 push（小改动）
- ✅ 大功能从 feature/* 合并而来
- ✅ 允许存在小 bug，但不能阻塞主流程
- ⚠️ 定期合并到 main（通过 PR + review）

**命名**: `develop`

**创建方式**:
```bash
# 从 main 创建 develop 分支
git checkout main
git pull origin main
git checkout -b develop
git push -u origin develop
```

---

### 3. feature/* 分支

**用途**: 独立功能开发

**规则**:
- ✅ 从 `develop` 创建
- ✅ 开发完成后合并回 `develop`
- ✅ 合并后可以删除
- ⚠️ 功能完成前不要合并到 develop

**命名规范**:
```
feature/<ticket-id>-<简短描述>

示例:
- feature/ticket-002-auth-api
- feature/ticket-004-ui-polish
- feature/ticket-005-booking-system
```

**创建方式**:
```bash
# 从 develop 创建 feature 分支
git checkout develop
git pull origin develop
git checkout -b feature/ticket-002-auth-api
git push -u origin feature/ticket-002-auth-api
```

---

### 4. claude/architecture-docs-* 分支

**用途**: Architect 专用，用于架构设计和文档

**规则**:
- ✅ Architect 专用分支
- ✅ 只包含 `.claude/` 和文档变更
- ✅ review 通过后合并到 main
- ✅ 分支名必须以 `claude/` 开头，以 session ID 结尾

**命名规范**:
```
claude/<描述>-<sessionId>

示例:
- claude/architecture-docs-LMh44
- claude/ticket-creation-Xy5Km
```

---

### 5. hotfix/* 分支（紧急修复）

**用途**: 生产环境紧急 bug 修复

**规则**:
- ✅ 从 `main` 创建
- ✅ 修复后同时合并到 `main` 和 `develop`
- ⚠️ 仅用于紧急修复，非紧急问题走正常流程

**命名规范**:
```
hotfix/<issue-id>-<简短描述>

示例:
- hotfix/critical-jwt-leak
- hotfix/db-connection-pool
```

---

## 🔄 标准工作流

### 场景 1: Builder 开发新功能

```bash
# 1. 从 develop 创建 feature 分支
git checkout develop
git pull origin develop
git checkout -b feature/ticket-005-booking-api
git push -u origin feature/ticket-005-booking-api

# 2. 开发并提交（TDD 循环）
# Red -> Green -> Refactor
git add backend/src/modules/booking/
git commit -m "feat(booking): 实现预约创建 API"
git push

# 3. 功能完成后，合并到 develop
git checkout develop
git pull origin develop
git merge feature/ticket-005-booking-api
git push origin develop

# 4. 删除 feature 分支（可选）
git branch -d feature/ticket-005-booking-api
git push origin --delete feature/ticket-005-booking-api
```

---

### 场景 2: Architect Review + 合并到 main

```bash
# 1. Architect checkout develop 分支进行 review
git checkout develop
git pull origin develop

# 2. 运行测试和检查
cd backend
pnpm run test        # 运行单元测试
pnpm run test:e2e    # 运行集成测试
pnpm run lint        # 代码检查

# 3. 创建 code review 报告
# 编写 .claude/memory/code_review_<date>.md

# 4. 如果 review 通过，合并到 main
git checkout main
git pull origin main
git merge develop
git push origin main

# 5. 同步到 architecture 分支
git checkout claude/architecture-docs-LMh44
git merge main
git push origin claude/architecture-docs-LMh44
```

---

### 场景 3: Architect 创建 Tickets 和文档

```bash
# 1. 从当前 architecture 分支或创建新分支
git checkout -b claude/ticket-creation-<sessionId>

# 2. 创建 Ticket 和架构文档
# 编辑 .claude/tickets/*.md
# 编辑 .claude/memory/*.md

# 3. 提交架构变更
git add .claude/
git commit -m "docs(architect): 创建 Ticket-006 预约管理 API"
git push -u origin claude/ticket-creation-<sessionId>

# 4. 创建 PR 合并到 main
gh pr create --title "docs: 创建预约管理 Ticket" --base main

# 5. 自行合并（Architect 有权限）
gh pr merge --squash
```

---

### 场景 4: 紧急修复生产 Bug

```bash
# 1. 从 main 创建 hotfix 分支
git checkout main
git pull origin main
git checkout -b hotfix/critical-jwt-leak

# 2. 修复 bug 并测试
# 修复代码...
pnpm run test

# 3. 提交修复
git add .
git commit -m "fix(auth): 修复 JWT secret 泄露漏洞"
git push -u origin hotfix/critical-jwt-leak

# 4. 合并到 main
git checkout main
git merge hotfix/critical-jwt-leak
git push origin main

# 5. 合并到 develop
git checkout develop
git merge hotfix/critical-jwt-leak
git push origin develop

# 6. 删除 hotfix 分支
git branch -d hotfix/critical-jwt-leak
git push origin --delete hotfix/critical-jwt-leak
```

---

## 📝 Commit 规范

### Conventional Commits

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Type 类型

| Type | 说明 | 示例 |
|------|------|------|
| `feat` | 新功能 | `feat(auth): 实现手机验证码登录` |
| `fix` | Bug 修复 | `fix(booking): 修复重复预约问题` |
| `docs` | 文档变更 | `docs(architect): 更新架构设计文档` |
| `test` | 测试相关 | `test(auth): 补充登录 API 测试用例` |
| `refactor` | 重构 | `refactor(core): 优化适配器注入逻辑` |
| `perf` | 性能优化 | `perf(booking): 优化座位查询缓存` |
| `style` | 代码格式 | `style(ui): 统一组件命名规范` |
| `chore` | 构建/配置 | `chore(deps): 升级 NestJS 到 v11` |

### Scope 范围

**后端**:
- `auth` - 认证模块
- `booking` - 预约模块
- `user` - 用户模块
- `room` - 教室模块
- `admin` - 管理模块

**前端**:
- `ui` - UI 组件
- `core` - 核心逻辑
- `pages` - 页面
- `stores` - 状态管理

**基础设施**:
- `infra` - 基础设施
- `architect` - 架构设计
- `ci` - CI/CD

### 示例

```bash
# 好的提交
git commit -m "feat(auth): 实现短信验证码登录

- 集成阿里云短信服务
- 添加验证码 Redis 缓存
- 实现验证码防重发机制

Refs: Ticket-002"

# 不好的提交
git commit -m "fix bug"  # ❌ 太简略
git commit -m "update code"  # ❌ 无意义
```

---

## 🚦 Review 标准

### Code Review Checklist

Architect review 代码时检查以下项目：

#### ✅ 功能完整性
- [ ] 所有 Ticket 要求的功能都已实现
- [ ] 边界情况已处理
- [ ] 错误处理完善

#### ✅ 测试覆盖
- [ ] 单元测试覆盖率 ≥ 80%
- [ ] 关键路径有集成测试
- [ ] 测试用例覆盖 Happy Path 和 Unhappy Path

#### ✅ 代码质量
- [ ] 符合命名规范（英文语义化）
- [ ] 注释完整（简体中文）
- [ ] 无硬编码配置
- [ ] 无安全漏洞（SQL 注入、XSS、CSRF 等）

#### ✅ 架构一致性
- [ ] 遵循 Interface Fence Rule（前端）
- [ ] 遵循分层架构（后端）
- [ ] 使用适配器模式（前端平台 API）

#### ✅ 文档完整性
- [ ] API 文档更新（Swagger）
- [ ] README 更新（如有必要）
- [ ] Ticket 状态更新

---

## 🎯 Review 评分标准

| 评分 | 级别 | 说明 | 操作 |
|------|------|------|------|
| 5.0 | Excellent | 完美，可直接合并 | ✅ 立即合并到 main |
| 4.5-4.9 | Very Good | 优秀，小改进后合并 | ⚠️ 微调后合并 |
| 4.0-4.4 | Good | 良好，需要改进 | ⚠️ 修复后合并 |
| 3.0-3.9 | Needs Work | 需要返工 | ❌ 打回重做 |
| <3.0 | Poor | 不合格 | ❌ 拒绝合并 |

**合并标准**: 评分 ≥ 4.0 且无 P0/P1 问题

---

## 🔐 分支保护规则

建议在 GitHub 设置以下保护规则：

### main 分支保护

```yaml
Branch protection rules for 'main':
  - Require pull request before merging
  - Require approvals: 1 (Architect)
  - Require status checks to pass
  - Require branches to be up to date
  - Do not allow force pushes
  - Do not allow deletions
```

### develop 分支保护

```yaml
Branch protection rules for 'develop':
  - Require status checks to pass (CI tests)
  - Allow force pushes (for rebase)
  - Allow deletions: No
```

---

## 📚 示例场景总结

### Builder 的典型一天

```bash
# 早上：查看 Ticket，开始新功能
git checkout develop
git pull origin develop
git checkout -b feature/ticket-006-booking-api

# 上午：TDD 循环开发
git add . && git commit -m "test(booking): 添加创建预约测试用例"
git add . && git commit -m "feat(booking): 实现创建预约 API"
git add . && git commit -m "refactor(booking): 优化预约时间验证逻辑"
git push

# 下午：功能完成，合并到 develop
git checkout develop
git merge feature/ticket-006-booking-api
git push origin develop

# 通知 Architect review
# 发消息："@Architect Ticket-006 已完成，请 review"
```

### Architect 的 Review 流程

```bash
# 收到通知后，切换到 develop 分支
git checkout develop
git pull origin develop

# 运行测试
cd backend
pnpm run test
pnpm run lint

# 阅读代码，创建 review 报告
code .claude/memory/code_review_2026-01-25.md

# Review 通过，合并到 main
git checkout main
git merge develop
git push origin main

# 反馈给 Builder
# 发消息："✅ Ticket-006 review 通过，已合并到 main"
```

---

## 🚀 快速参考

### 常用命令

```bash
# 查看所有分支
git branch -a

# 查看当前分支状态
git status

# 查看提交历史
git log --oneline --graph -20

# 同步远程分支
git fetch origin

# 删除已合并的本地分支
git branch --merged | grep -v "\*\|main\|develop" | xargs -n 1 git branch -d

# 查看分支差异
git diff main..develop

# 检查哪些提交在 develop 但不在 main
git log main..develop --oneline
```

---

## 📖 总结

### 核心要点

1. **develop 是日常开发主分支**，Builder 主要在这里工作
2. **feature/* 用于大功能隔离**，完成后合并到 develop
3. **main 受保护**，只接受 review 通过的代码
4. **Architect review 是质量门**，评分 ≥ 4.0 才能合并
5. **遵循 Conventional Commits**，保持提交历史清晰

### 优势

- ✅ **代码质量有保障**：main 分支始终是高质量代码
- ✅ **开发效率高**：Builder 可以在 develop 快速迭代
- ✅ **风险可控**：问题代码不会进入 main
- ✅ **历史清晰**：Git 历史结构清晰，易于追溯
- ✅ **团队协作流畅**：角色分工明确

---

**文档维护者**: Architect (Antigravity)  
**最后更新**: 2026-01-25
