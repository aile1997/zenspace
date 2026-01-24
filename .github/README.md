# GitHub 工作流配置说明

## 📋 工作流概览

本项目配置了完整的 GitHub Actions 工作流和 Git Hooks，用于自动化测试、代码质量检查和防止误操作。

---

## 🔧 工作流文件

### 1. `.github/workflows/test-protection.yml`

**触发条件**:
- Pull Request 修改 `frontend/packages/core/tests/**` 或 `frontend/packages/core/src/**`
- 推送到 `main` 或 `develop` 分支

**功能**:
- ✅ 检查测试文件完整性（确保 4 个核心测试文件存在）
- ✅ 运行核心层测试
- ✅ 零污染检查（确保 core 层没有 `uni.xxx` 调用）

### 2. `.github/workflows/ci.yml`

**触发条件**:
- 推送到 `main` 或 `develop` 分支
- 创建 Pull Request

**功能**:
- ✅ 前端 CI（类型检查、测试、构建）
- ✅ 后端 CI（类型检查、Lint、测试、构建）
- ✅ 代码质量检查（文件命名、接口围栏原则）

---

## 🪝 Git Hooks

### Pre-commit Hook

**位置**: `.husky/pre-commit`

**检查项目**:
1. ✅ 测试文件完整性检查
2. ✅ 零污染检查（`uni.xxx` 调用检测）
3. ✅ 运行核心层测试

**失败后果**: 阻止提交

### Pre-push Hook

**位置**: `.husky/pre-push`

**检查项目**:
1. ✅ 运行完整测试套件

**失败后果**: 阻止推送

### Commit-msg Hook

**位置**: `.husky/commit-msg`

**检查项目**:
1. ✅ 提交消息格式检查（约定式提交规范）

**允许的格式**:
- `feat: 添加用户登录功能`
- `fix(auth): 修复验证码验证问题`
- `docs: 更新 README`
- `test: 添加 useAuth 测试用例`
- `chore: 更新依赖版本`

**失败后果**: 阻止提交

---

## 🚀 初始化设置

### 自动化设置

运行设置脚本：

```powershell
# Windows PowerShell
.\scripts\setup-githooks.sh
```

### 手动设置

如果自动化脚本无法运行，请按以下步骤手动设置：

```bash
# 1. 安装 husky
pnpm add -D husky
pnpm exec husky install

# 2. 设置钩子执行权限（Linux/Mac）
chmod +x .husky/pre-commit
chmod +x .husky/pre-push
chmod +x .husky/commit-msg

# 3. 配置 package.json prepare 脚本
# 在根 package.json 的 scripts 中添加:
# "prepare": "husky install"
```

---

## 📝 必需测试文件

以下测试文件**必须存在**，否则 CI/CD 和 Pre-commit Hook 将失败：

1. `frontend/packages/core/tests/composables/useAuth.spec.ts`
2. `frontend/packages/core/tests/composables/useBooking.spec.ts`
3. `frontend/packages/core/tests/composables/useSeat.spec.ts`
4. `frontend/packages/core/tests/composables/useZone.spec.ts`

---

## ⚠️ 零污染规则

Core 层（`frontend/packages/core/src/`）**严禁**使用以下 API：

| 禁用 API | 说明 |
|:---------|:-----|
| `uni.xxx` | UniApp 特定 API |
| `wx.xxx` | 微信小程序 API |
| `my.xxx` | 支付宝小程序 API |
| `swan.xxx` | 百度智能小程序 API |
| `window.xxx` | 浏览器 API |
| `navigator.xxx` | 浏览器导航 API |
| `document.xxx` | DOM API |

**替代方案**: 通过 `adapters/` 接口进行抽象

---

## 🔄 提交工作流

### 推荐的开发流程

```bash
# 1. 拉取最新代码
git pull origin develop

# 2. 创建功能分支
git feat/add-new-feature

# 3. 进行开发并提交
git add .
git commit -m "feat: 添加新功能"

# 4. 推送分支
git push origin feat/add-new-feature

# 5. 创建 Pull Request
```

### 提交消息格式

```
<type>(<scope>): <subject>

<body>

<footer>
```

**Type 类型**:
- `feat`: 新功能
- `fix`: 修复 Bug
- `docs`: 文档更新
- `style`: 代码格式（不影响代码运行）
- `refactor`: 重构（既不是新功能也不是修复 Bug）
- `test`: 添加测试
- `chore`: 构建过程或辅助工具的变动
- `perf`: 性能优化
- `ci`: CI 配置文件和脚本的变动
- `build`: 影响构建系统或外部依赖的变动

**Scope 范围**:
- `auth`: 认证模块
- `booking`: 预约模块
- `seat`: 座位模块
- `zone`: 区域模块
- `core`: 核心逻辑层
- `ui`: UI 层
- `backend`: 后端

**Subject 主题**:
- 简洁描述做了什么
- 不超过 50 个字符
- 使用中文
- 不要以句号结尾

**示例**:
```
feat(auth): 添加微信登录功能

- 接入微信开放平台 SDK
- 实现微信授权回调处理
- 添加微信用户信息绑定

Closes #123
```

---

## 🧪 测试策略

### 本地开发

```bash
# 运行所有测试
pnpm --filter @zenspace/core test

# 监听模式运行测试
pnpm --filter @zenspace/core test:watch
```

### CI/CD 自动运行

- **Pull Request**: 自动运行所有检查和测试
- **Push to main/develop**: 自动运行完整 CI 流程

---

## 🐛 故障排查

### Pre-commit Hook 失败

**错误**: `❌ 错误: 测试文件缺失: xxx.spec.ts`

**解决**: 恢复测试文件后再提交

**错误**: `❌ 错误: Core 层发现 uni.xxx 调用!`

**解决**: 将平台特定 API 移至 `ui/utils/adapters.ts`

### Commit-msg Hook 失败

**错误**: `❌ 错误: 提交消息格式不符合约定式提交规范`

**解决**: 按照约定式提交格式重写提交消息

### CI 工作流失败

查看 Actions 日志，根据错误信息进行修复：

1. 进入 GitHub 仓库页面
2. 点击 "Actions" 标签
3. 选择失败的工作流运行
4. 查看详细日志

---

## 📚 相关文档

- [约定式提交规范](https://www.conventionalcommits.org/zh-hans/)
- [Husky 文档](https://typicode.github.io/husky/)
- [GitHub Actions 文档](https://docs.github.com/cn/actions)
