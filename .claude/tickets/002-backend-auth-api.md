# Ticket-002: 后端用户认证 API 开发

> **工票类型**: Backend Development
> **优先级**: ⭐⭐⭐ P0 (阻塞性任务)
> **预估工作量**: 2-3 天
> **分配给**: Builder (后端)
> **状态**: 📋 待开始
> **创建日期**: 2026-01-24
> **依赖**: Prisma Schema ✅

---

## 1. 任务目标

实现 ZenSpace 后端的**用户认证与授权系统**，包括手机验证码登录、JWT Token 管理、用户信息获取等核心功能。

---

## 2. 功能需求

### 2.1 API 端点清单

| 端点 | 方法 | 功能 | 优先级 |
|:-----|:-----|:-----|:------|
| `/api/auth/send-code` | POST | 发送手机验证码 | P0 |
| `/api/auth/login` | POST | 手机验证码登录 | P0 |
| `/api/auth/logout` | POST | 用户登出 | P0 |
| `/api/auth/refresh` | POST | 刷新 Access Token | P0 |
| `/api/auth/profile` | GET | 获取当前用户信息 | P0 |
| `/api/auth/update-profile` | PUT | 更新用户信息 | P1 |

### 2.2 详细功能描述

#### 📱 POST `/api/auth/send-code` - 发送验证码

**请求体**:
```typescript
{
  phone: string  // 手机号，11 位数字
}
```

**响应**:
```typescript
{
  success: boolean
  message: string
  data: {
    expiresIn: number  // 验证码有效期（秒）
  }
}
```

**业务逻辑**:
1. 验证手机号格式（11 位数字）
2. 检查是否在 60 秒内重复发送（防刷）
3. 生成 6 位随机验证码
4. 存储到 Redis，设置 5 分钟过期
5. 调用第三方短信服务发送（开发阶段可 Mock）
6. 返回成功响应

**错误处理**:
- 400: 手机号格式错误
- 429: 请求过于频繁（60 秒内重复）
- 500: 短信发送失败

---

#### 🔑 POST `/api/auth/login` - 手机验证码登录

**请求体**:
```typescript
{
  phone: string      // 手机号
  code: string       // 验证码
  deviceInfo?: {     // 可选的设备信息
    platform: string
    model: string
  }
}
```

**响应**:
```typescript
{
  success: boolean
  message: string
  data: {
    user: {
      id: string
      phone: string
      nickname: string | null
      avatar: string | null
      level: 'NORMAL' | 'VIP'
      points: number
      creditScore: number
    }
    accessToken: string   // 访问令牌，有效期 2 小时
    refreshToken: string  // 刷新令牌，有效期 30 天
  }
}
```

**业务逻辑**:
1. 验证手机号和验证码格式
2. 从 Redis 获取验证码并验证
   - 验证码正确：继续
   - 验证码错误或过期：返回 401
3. 验证成功后删除 Redis 中的验证码（一次性使用）
4. 检查用户是否存在：
   - 存在：更新最后登录时间
   - 不存在：创建新用户（注册）
5. 生成 JWT Token：
   - Access Token: 包含 userId, phone, level，有效期 2 小时
   - Refresh Token: 随机字符串，存储到数据库，有效期 30 天
6. 返回用户信息和 Token

**错误处理**:
- 400: 参数格式错误
- 401: 验证码错误或过期
- 500: 服务器内部错误

---

#### 🚪 POST `/api/auth/logout` - 用户登出

**请求头**:
```
Authorization: Bearer {accessToken}
```

**响应**:
```typescript
{
  success: boolean
  message: string
}
```

**业务逻辑**:
1. 验证 Access Token
2. 从数据库删除该用户的 Refresh Token
3. 返回成功响应

**错误处理**:
- 401: Token 无效或已过期
- 500: 服务器内部错误

---

#### 🔄 POST `/api/auth/refresh` - 刷新 Token

**请求体**:
```typescript
{
  refreshToken: string
}
```

**响应**:
```typescript
{
  success: boolean
  data: {
    accessToken: string   // 新的访问令牌
    refreshToken: string  // 新的刷新令牌
  }
}
```

**业务逻辑**:
1. 验证 Refresh Token 格式
2. 从数据库查询 Refresh Token
   - 不存在或已过期：返回 401
3. 验证成功后：
   - 删除旧的 Refresh Token
   - 生成新的 Access Token 和 Refresh Token
   - 存储新的 Refresh Token 到数据库
4. 返回新的 Token

**错误处理**:
- 401: Refresh Token 无效或已过期
- 500: 服务器内部错误

---

#### 👤 GET `/api/auth/profile` - 获取用户信息

**请求头**:
```
Authorization: Bearer {accessToken}
```

**响应**:
```typescript
{
  success: boolean
  data: {
    id: string
    phone: string
    nickname: string | null
    avatar: string | null
    level: 'NORMAL' | 'VIP'
    points: number
    creditScore: number
    createdAt: string
    vipExpireAt: string | null
  }
}
```

**业务逻辑**:
1. 验证 Access Token（通过 JWT Guard）
2. 从数据库获取用户完整信息
3. 返回用户信息

**错误处理**:
- 401: Token 无效或已过期
- 404: 用户不存在
- 500: 服务器内部错误

---

## 3. 技术实现要求

### 3.1 技术栈

| 技术 | 用途 |
|:-----|:-----|
| **NestJS** | Web 框架 |
| **Prisma** | ORM，数据库操作 |
| **Passport** | 认证中间件 |
| **passport-jwt** | JWT 策略 |
| **bcrypt** | 密码加密（如需密码登录） |
| **ioredis** | Redis 客户端（验证码存储） |
| **class-validator** | 请求参数验证 |
| **class-transformer** | 数据转换 |

### 3.2 目录结构

```
backend/src/
├── auth/
│   ├── auth.module.ts          # 认证模块
│   ├── auth.controller.ts      # 控制器
│   ├── auth.service.ts         # 业务逻辑
│   ├── dto/
│   │   ├── send-code.dto.ts    # 发送验证码 DTO
│   │   ├── login.dto.ts        # 登录 DTO
│   │   ├── refresh-token.dto.ts # 刷新 Token DTO
│   │   └── update-profile.dto.ts # 更新用户信息 DTO
│   ├── guards/
│   │   └── jwt-auth.guard.ts   # JWT 守卫
│   ├── strategies/
│   │   └── jwt.strategy.ts     # JWT 策略
│   ├── decorators/
│   │   └── current-user.decorator.ts # 当前用户装饰器
│   └── interfaces/
│       └── jwt-payload.interface.ts  # JWT Payload 接口
├── common/
│   ├── filters/
│   │   └── http-exception.filter.ts  # 全局异常过滤器
│   ├── interceptors/
│   │   └── transform.interceptor.ts  # 响应转换拦截器
│   └── pipes/
│       └── validation.pipe.ts        # 全局验证管道
└── config/
    ├── jwt.config.ts            # JWT 配置
    └── redis.config.ts          # Redis 配置
```

### 3.3 核心代码示例

#### DTO 定义

```typescript
// auth/dto/login.dto.ts
import { IsString, Matches, Length } from 'class-validator'

export class LoginDto {
  @IsString()
  @Matches(/^1[3-9]\d{9}$/, { message: '手机号格式错误' })
  phone: string

  @IsString()
  @Length(6, 6, { message: '验证码必须是 6 位' })
  code: string
}
```

#### Service 业务逻辑

```typescript
// auth/auth.service.ts
import { Injectable, UnauthorizedException } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { PrismaService } from '../prisma/prisma.service'
import { RedisService } from '../redis/redis.service'
import { LoginDto } from './dto/login.dto'

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
    private redis: RedisService
  ) {}

  async sendCode(phone: string): Promise<{ expiresIn: number }> {
    // 1. 检查是否在 60 秒内重复发送
    const lastSendKey = `sms:last:${phone}`
    const lastSend = await this.redis.get(lastSendKey)
    if (lastSend) {
      throw new UnauthorizedException('请求过于频繁，请稍后再试')
    }

    // 2. 生成 6 位验证码
    const code = Math.floor(100000 + Math.random() * 900000).toString()

    // 3. 存储到 Redis，5 分钟过期
    const codeKey = `sms:code:${phone}`
    await this.redis.setex(codeKey, 300, code)
    await this.redis.setex(lastSendKey, 60, '1')

    // 4. 发送短信（开发阶段打印到控制台）
    console.log(`[SMS] Phone: ${phone}, Code: ${code}`)

    return { expiresIn: 300 }
  }

  async login(dto: LoginDto) {
    const { phone, code } = dto

    // 1. 验证验证码
    const codeKey = `sms:code:${phone}`
    const storedCode = await this.redis.get(codeKey)

    if (!storedCode || storedCode !== code) {
      throw new UnauthorizedException('验证码错误或已过期')
    }

    // 2. 删除验证码（一次性使用）
    await this.redis.del(codeKey)

    // 3. 查找或创建用户
    let user = await this.prisma.user.findUnique({ where: { phone } })

    if (!user) {
      user = await this.prisma.user.create({
        data: {
          phone,
          level: 'NORMAL',
          points: 0,
          creditScore: 100
        }
      })
    } else {
      // 更新最后登录时间
      user = await this.prisma.user.update({
        where: { id: user.id },
        data: { updatedAt: new Date() }
      })
    }

    // 4. 生成 Token
    const payload = { sub: user.id, phone: user.phone, level: user.level }
    const accessToken = this.jwt.sign(payload, { expiresIn: '2h' })
    const refreshToken = this.generateRefreshToken()

    // 5. 存储 Refresh Token 到数据库
    await this.prisma.refreshToken.create({
      data: {
        token: refreshToken,
        userId: user.id,
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 天
      }
    })

    return {
      user: {
        id: user.id,
        phone: user.phone,
        nickname: user.nickname,
        avatar: user.avatar,
        level: user.level,
        points: user.points,
        creditScore: user.creditScore
      },
      accessToken,
      refreshToken
    }
  }

  private generateRefreshToken(): string {
    // 生成 32 字节随机字符串
    return require('crypto').randomBytes(32).toString('hex')
  }

  // 其他方法...
}
```

#### Controller 路由

```typescript
// auth/auth.controller.ts
import { Controller, Post, Get, Body, UseGuards } from '@nestjs/common'
import { AuthService } from './auth.service'
import { SendCodeDto } from './dto/send-code.dto'
import { LoginDto } from './dto/login.dto'
import { JwtAuthGuard } from './guards/jwt-auth.guard'
import { CurrentUser } from './decorators/current-user.decorator'

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('send-code')
  async sendCode(@Body() dto: SendCodeDto) {
    const data = await this.authService.sendCode(dto.phone)
    return {
      success: true,
      message: '验证码已发送',
      data
    }
  }

  @Post('login')
  async login(@Body() dto: LoginDto) {
    const data = await this.authService.login(dto)
    return {
      success: true,
      message: '登录成功',
      data
    }
  }

  @Post('logout')
  @UseGuards(JwtAuthGuard)
  async logout(@CurrentUser() user) {
    await this.authService.logout(user.id)
    return {
      success: true,
      message: '登出成功'
    }
  }

  @Get('profile')
  @UseGuards(JwtAuthGuard)
  async getProfile(@CurrentUser() user) {
    const data = await this.authService.getProfile(user.id)
    return {
      success: true,
      data
    }
  }
}
```

### 3.4 数据库 Schema 补充

需要在 Prisma Schema 中添加 RefreshToken 模型：

```prisma
// prisma/schema.prisma

model RefreshToken {
  id        String   @id @default(uuid())
  token     String   @unique
  userId    String
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  expiresAt DateTime
  createdAt DateTime @default(now())

  @@index([userId])
  @@index([token])
}

model User {
  // 已有字段...
  refreshTokens RefreshToken[]
}
```

运行迁移：
```bash
pnpm prisma migrate dev --name add-refresh-token
```

---

## 4. 测试要求

### 4.1 单元测试

**文件**: `auth/auth.service.spec.ts`

**测试用例清单**:

```typescript
describe('AuthService', () => {
  describe('sendCode', () => {
    it('应该成功发送验证码', async () => {})
    it('应该在 60 秒内阻止重复发送', async () => {})
    it('应该生成 6 位数字验证码', async () => {})
  })

  describe('login', () => {
    it('应该能够使用正确的验证码登录', async () => {})
    it('应该在验证码错误时抛出异常', async () => {})
    it('应该在验证码过期时抛出异常', async () => {})
    it('应该为新用户创建账号', async () => {})
    it('应该为已有用户更新登录时间', async () => {})
    it('应该生成有效的 Access Token', async () => {})
    it('应该生成有效的 Refresh Token', async () => {})
  })

  describe('logout', () => {
    it('应该成功删除 Refresh Token', async () => {})
  })

  describe('refreshToken', () => {
    it('应该使用有效的 Refresh Token 生成新 Token', async () => {})
    it('应该在 Refresh Token 无效时抛出异常', async () => {})
    it('应该在 Refresh Token 过期时抛出异常', async () => {})
  })

  describe('getProfile', () => {
    it('应该返回完整的用户信息', async () => {})
    it('应该在用户不存在时抛出异常', async () => {})
  })
})
```

**覆盖率要求**: ≥ 80%

### 4.2 集成测试

**文件**: `auth/auth.controller.spec.ts` (E2E)

**测试流程**:

```typescript
describe('Auth API (e2e)', () => {
  it('POST /auth/send-code - 发送验证码', () => {})
  it('POST /auth/login - 登录成功', () => {})
  it('POST /auth/login - 验证码错误', () => {})
  it('POST /auth/refresh - 刷新 Token', () => {})
  it('GET /auth/profile - 获取用户信息', () => {})
  it('POST /auth/logout - 登出', () => {})
})
```

---

## 5. 验收标准 (DoD - Definition of Done)

**必须满足以下所有条件才能认为任务完成**:

- [ ] ✅ 所有 6 个 API 端点已实现
- [ ] ✅ 单元测试通过率 100%，覆盖率 ≥ 80%
- [ ] ✅ 集成测试通过率 100%
- [ ] ✅ Swagger API 文档已生成
- [ ] ✅ 错误处理完善（400/401/429/500）
- [ ] ✅ 日志记录完善（登录、登出、异常）
- [ ] ✅ 代码通过 ESLint 检查
- [ ] ✅ 代码通过 Prettier 格式化
- [ ] ✅ 提交消息符合约定式提交规范
- [ ] ✅ PR 通过 Architect Code Review

---

## 6. 开发流程 (TDD)

### 步骤 1: 编写失败的测试 (Red)

```bash
cd backend
pnpm run test:watch auth.service.spec.ts
```

编写第一个测试用例，预期失败。

### 步骤 2: 实现最小代码 (Green)

编写代码使测试通过。

### 步骤 3: 重构优化 (Refactor)

在测试通过的前提下优化代码。

### 步骤 4: 重复循环

继续下一个功能点。

---

## 7. 依赖与前置条件

### 前置条件

- ✅ Prisma Schema 已定义 User 模型
- ✅ PostgreSQL 数据库已启动
- ✅ Redis 已安装并启动
- ✅ NestJS 项目已初始化

### 需要安装的依赖

```bash
cd backend

# JWT 相关
pnpm add @nestjs/jwt @nestjs/passport passport passport-jwt
pnpm add -D @types/passport-jwt

# 验证相关
pnpm add class-validator class-transformer

# Redis
pnpm add ioredis
pnpm add -D @types/ioredis

# 加密
pnpm add bcrypt
pnpm add -D @types/bcrypt
```

---

## 8. 参考资料

- [NestJS 认证文档](https://docs.nestjs.com/security/authentication)
- [Passport JWT 策略](https://www.passportjs.org/packages/passport-jwt/)
- [Prisma Client API](https://www.prisma.io/docs/reference/api-reference/prisma-client-reference)
- [Redis 命令参考](https://redis.io/commands/)

---

## 9. 提交指南

### 提交消息格式

```
feat(auth): 实现用户认证 API

- 添加手机验证码登录功能
- 实现 JWT Token 生成与验证
- 添加 Refresh Token 刷新机制
- 完成单元测试和集成测试

Closes #2
```

### PR 标题

```
feat(auth): 实现用户认证 API 模块
```

---

## 10. 联系方式

**有疑问?** 请查阅以下文档或联系 Architect：

- `.claude/memory/architecture_overview.md` - 架构总览
- `.claude/contracts/prd.md` - 产品需求文档
- `.claude/memory/tech_constraints.md` - 技术约束

---

**工票创建者**: Architect
**工票创建日期**: 2026-01-24
**预计完成日期**: 2026-01-27
