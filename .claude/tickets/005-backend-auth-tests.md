# Ticket-005: 补充后端认证模块测试

**优先级**: 🔥 P0 (阻塞)  
**类型**: Test  
**预计工时**: 4-6 小时  
**依赖**: Ticket-002 (已完成代码，缺少测试)  
**创建时间**: 2026-01-25  
**创建人**: Architect (Antigravity)  
**负责人**: Builder (GLM)

---

## 📋 背景

Ticket-002 后端认证 API 的代码已经实现并提交到 main 分支 (commit `81be558`)，但 **完全缺少测试文件**。

根据 Code Review 报告 `.claude/memory/code_review_backend_2026-01-25.md`：
- **测试覆盖**: 0.0/5.0 ❌
- **总体评分**: 3.2/5.0 🟡
- **状态**: 需要改进，不能合并到生产

**问题**:
1. 违反了 TDD 原则
2. 违反了 Ticket-002 的要求（15+ 测试用例）
3. 无法保证代码质量
4. 缺少回归测试

---

## 🎯 任务目标

为后端认证模块补充完整的测试，包括：
1. **单元测试**: AuthService, RedisService, PrismaService
2. **Controller 测试**: AuthController
3. **集成测试**: E2E 端到端测试
4. **测试覆盖率**: ≥ 80%

---

## 📦 交付物

### 必须创建的测试文件

```bash
backend/src/modules/auth/
├── auth.controller.spec.ts      # Controller 单元测试
├── auth.service.spec.ts         # Service 单元测试
└── tests/
    └── auth.e2e.spec.ts         # E2E 集成测试

backend/src/redis/
└── redis.service.spec.ts        # Redis Service 测试

backend/src/prisma/
└── prisma.service.spec.ts       # Prisma Service 测试
```

---

## 🧪 测试用例清单

### 1. 发送验证码 API (3 用例)

**端点**: `POST /api/auth/send-code`

#### 测试用例 1.1: 成功发送验证码
```typescript
describe('POST /api/auth/send-code', () => {
  it('应该成功发送验证码', async () => {
    const response = await request(app.getHttpServer())
      .post('/api/auth/send-code')
      .send({ phone: '13800138000' })
      .expect(200);

    expect(response.body).toEqual({
      message: '验证码发送成功',
    });

    // 验证 Redis 中存储了验证码
    const code = await redisService.getVerificationCode('13800138000');
    expect(code).toMatch(/^\d{6}$/);
  });
});
```

#### 测试用例 1.2: 60 秒内重复发送返回 400
```typescript
it('应该拒绝 60 秒内重复发送验证码', async () => {
  // 第一次发送成功
  await request(app.getHttpServer())
    .post('/api/auth/send-code')
    .send({ phone: '13800138001' })
    .expect(200);

  // 第二次发送失败
  const response = await request(app.getHttpServer())
    .post('/api/auth/send-code')
    .send({ phone: '13800138001' })
    .expect(400);

  expect(response.body.message).toContain('验证码已发送，请稍后再试');
});
```

#### 测试用例 1.3: 手机号格式错误返回 400
```typescript
it('应该拒绝无效的手机号格式', async () => {
  const invalidPhones = [
    '12345',           // 太短
    '1234567890123',   // 太长
    '23800138000',     // 不以 1 开头
    'abc',             // 非数字
  ];

  for (const phone of invalidPhones) {
    await request(app.getHttpServer())
      .post('/api/auth/send-code')
      .send({ phone })
      .expect(400);
  }
});
```

---

### 2. 登录 API (5 用例)

**端点**: `POST /api/auth/login`

#### 测试用例 2.1: 验证码正确，首次登录自动注册
```typescript
describe('POST /api/auth/login', () => {
  it('应该自动注册新用户并返回 Token', async () => {
    const phone = '13900139000';
    const code = '123456';

    // 预设验证码
    await redisService.setVerificationCode(phone, code);

    const response = await request(app.getHttpServer())
      .post('/api/auth/login')
      .send({ phone, code })
      .expect(200);

    // 验证响应结构
    expect(response.body).toHaveProperty('accessToken');
    expect(response.body).toHaveProperty('refreshToken');
    expect(response.body.user).toMatchObject({
      phone,
      nickname: `用户9000`, // 默认昵称
      level: 'REGULAR',
      points: 0,
      creditScore: 100,
    });

    // 验证用户已创建
    const user = await prismaService.user.findUnique({
      where: { phone },
    });
    expect(user).not.toBeNull();
  });
});
```

#### 测试用例 2.2: 验证码正确，已有用户正常登录
```typescript
it('应该让已存在用户成功登录', async () => {
  const phone = '13900139001';
  const code = '654321';

  // 预先创建用户
  await prismaService.user.create({
    data: {
      phone,
      nickname: '老用户',
    },
  });

  // 预设验证码
  await redisService.setVerificationCode(phone, code);

  const response = await request(app.getHttpServer())
    .post('/api/auth/login')
    .send({ phone, code })
    .expect(200);

  expect(response.body.user.nickname).toBe('老用户');
});
```

#### 测试用例 2.3: 验证码错误返回 401
```typescript
it('应该拒绝错误的验证码', async () => {
  const phone = '13900139002';
  await redisService.setVerificationCode(phone, '123456');

  const response = await request(app.getHttpServer())
    .post('/api/auth/login')
    .send({ phone, code: '999999' }) // 错误的验证码
    .expect(401);

  expect(response.body.message).toContain('验证码错误');
});
```

#### 测试用例 2.4: 验证码过期返回 401
```typescript
it('应该拒绝过期的验证码', async () => {
  const phone = '13900139003';

  const response = await request(app.getHttpServer())
    .post('/api/auth/login')
    .send({ phone, code: '123456' })
    .expect(401);

  expect(response.body.message).toContain('验证码已过期');
});
```

#### 测试用例 2.5: 手机号格式错误返回 400
```typescript
it('应该拒绝无效的手机号格式', async () => {
  await request(app.getHttpServer())
    .post('/api/auth/login')
    .send({ phone: 'invalid', code: '123456' })
    .expect(400);
});
```

---

### 3. 刷新 Token API (3 用例)

**端点**: `POST /api/auth/refresh`

#### 测试用例 3.1: Refresh Token 有效，返回新 Access Token
```typescript
describe('POST /api/auth/refresh', () => {
  it('应该返回新的 Access Token', async () => {
    // 先登录获取 Refresh Token
    const phone = '13900139004';
    const code = '123456';
    await redisService.setVerificationCode(phone, code);

    const loginResponse = await request(app.getHttpServer())
      .post('/api/auth/login')
      .send({ phone, code });

    const refreshToken = loginResponse.body.refreshToken;

    // 使用 Refresh Token 获取新 Access Token
    const response = await request(app.getHttpServer())
      .post('/api/auth/refresh')
      .send({ refreshToken })
      .expect(200);

    expect(response.body).toHaveProperty('accessToken');
    expect(response.body.accessToken).not.toBe(loginResponse.body.accessToken);
  });
});
```

#### 测试用例 3.2: Refresh Token 无效返回 401
```typescript
it('应该拒绝无效的 Refresh Token', async () => {
  const fakeToken = 'invalid.refresh.token';

  await request(app.getHttpServer())
    .post('/api/auth/refresh')
    .send({ refreshToken: fakeToken })
    .expect(401);
});
```

#### 测试用例 3.3: Refresh Token 已过期返回 401
```typescript
it('应该拒绝已登出的 Refresh Token', async () => {
  // 登录
  const phone = '13900139005';
  const code = '123456';
  await redisService.setVerificationCode(phone, code);

  const loginResponse = await request(app.getHttpServer())
    .post('/api/auth/login')
    .send({ phone, code });

  const refreshToken = loginResponse.body.refreshToken;
  const accessToken = loginResponse.body.accessToken;

  // 登出（删除 Refresh Token）
  await request(app.getHttpServer())
    .post('/api/auth/logout')
    .set('Authorization', `Bearer ${accessToken}`)
    .expect(200);

  // 尝试使用已登出的 Refresh Token
  await request(app.getHttpServer())
    .post('/api/auth/refresh')
    .send({ refreshToken })
    .expect(401);
});
```

---

### 4. 登出 API (2 用例)

**端点**: `POST /api/auth/logout`

#### 测试用例 4.1: 成功登出，删除 Refresh Token
```typescript
describe('POST /api/auth/logout', () => {
  it('应该成功登出并删除 Refresh Token', async () => {
    // 登录
    const phone = '13900139006';
    const code = '123456';
    await redisService.setVerificationCode(phone, code);

    const loginResponse = await request(app.getHttpServer())
      .post('/api/auth/login')
      .send({ phone, code });

    const accessToken = loginResponse.body.accessToken;
    const userId = loginResponse.body.user.id;

    // 登出
    const response = await request(app.getHttpServer())
      .post('/api/auth/logout')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);

    expect(response.body.message).toBe('登出成功');

    // 验证 Redis 中的 Refresh Token 已删除
    const storedToken = await redisService.getRefreshToken(userId);
    expect(storedToken).toBeNull();
  });
});
```

#### 测试用例 4.2: 未认证用户登出返回 401
```typescript
it('应该拒绝未认证用户的登出请求', async () => {
  await request(app.getHttpServer())
    .post('/api/auth/logout')
    .expect(401);
});
```

---

### 5. 获取用户信息 API (2 用例)

**端点**: `GET /api/auth/profile`

#### 测试用例 5.1: 已认证用户获取信息成功
```typescript
describe('GET /api/auth/profile', () => {
  it('应该返回当前用户信息', async () => {
    // 登录
    const phone = '13900139007';
    const code = '123456';
    await redisService.setVerificationCode(phone, code);

    const loginResponse = await request(app.getHttpServer())
      .post('/api/auth/login')
      .send({ phone, code });

    const accessToken = loginResponse.body.accessToken;

    // 获取用户信息
    const response = await request(app.getHttpServer())
      .get('/api/auth/profile')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);

    expect(response.body).toMatchObject({
      phone,
      nickname: '用户9007',
      level: 'REGULAR',
    });
  });
});
```

#### 测试用例 5.2: 未认证用户返回 401
```typescript
it('应该拒绝未认证用户的请求', async () => {
  await request(app.getHttpServer())
    .get('/api/auth/profile')
    .expect(401);
});
```

---

### 6. 更新用户信息 API (3 用例)

**端点**: `PUT /api/auth/update-profile`

#### 测试用例 6.1: 更新昵称成功
```typescript
describe('PUT /api/auth/update-profile', () => {
  it('应该成功更新用户昵称', async () => {
    // 登录
    const phone = '13900139008';
    const code = '123456';
    await redisService.setVerificationCode(phone, code);

    const loginResponse = await request(app.getHttpServer())
      .post('/api/auth/login')
      .send({ phone, code });

    const accessToken = loginResponse.body.accessToken;

    // 更新昵称
    const response = await request(app.getHttpServer())
      .put('/api/auth/update-profile')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ nickname: '新昵称' })
      .expect(200);

    expect(response.body.nickname).toBe('新昵称');
  });
});
```

#### 测试用例 6.2: 更新头像成功
```typescript
it('应该成功更新用户头像', async () => {
  // 登录
  const phone = '13900139009';
  const code = '123456';
  await redisService.setVerificationCode(phone, code);

  const loginResponse = await request(app.getHttpServer())
    .post('/api/auth/login')
    .send({ phone, code });

  const accessToken = loginResponse.body.accessToken;

  // 更新头像
  const avatarUrl = 'https://example.com/avatar.jpg';
  const response = await request(app.getHttpServer())
    .put('/api/auth/update-profile')
    .set('Authorization', `Bearer ${accessToken}`)
    .send({ avatar: avatarUrl })
    .expect(200);

  expect(response.body.avatar).toBe(avatarUrl);
});
```

#### 测试用例 6.3: 未认证用户返回 401
```typescript
it('应该拒绝未认证用户的请求', async () => {
  await request(app.getHttpServer())
    .put('/api/auth/update-profile')
    .send({ nickname: '新昵称' })
    .expect(401);
});
```

---

## 📝 测试文件模板

### auth.service.spec.ts 模板

```typescript
import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { PrismaService } from '@prisma/prisma.service';
import { RedisService } from '@redis/redis.service';
import { JwtService } from '@nestjs/jwt';
import { UnauthorizedException, BadRequestException } from '@nestjs/common';

describe('AuthService', () => {
  let service: AuthService;
  let prisma: PrismaService;
  let redis: RedisService;
  let jwt: JwtService;

  // Mock 对象
  const mockPrismaService = {
    user: {
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
  };

  const mockRedisService = {
    hasVerificationCode: jest.fn(),
    setVerificationCode: jest.fn(),
    getVerificationCode: jest.fn(),
    deleteVerificationCode: jest.fn(),
    setRefreshToken: jest.fn(),
    getRefreshToken: jest.fn(),
    deleteRefreshToken: jest.fn(),
  };

  const mockJwtService = {
    sign: jest.fn(),
    verify: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: RedisService, useValue: mockRedisService },
        { provide: JwtService, useValue: mockJwtService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    prisma = module.get<PrismaService>(PrismaService);
    redis = module.get<RedisService>(RedisService);
    jwt = module.get<JwtService>(JwtService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('sendCode', () => {
    it('应该成功发送验证码', async () => {
      mockRedisService.hasVerificationCode.mockResolvedValue(false);
      mockRedisService.setVerificationCode.mockResolvedValue(undefined);

      const result = await service.sendCode('13800138000');

      expect(result).toEqual({ message: '验证码发送成功' });
      expect(mockRedisService.setVerificationCode).toHaveBeenCalledWith(
        '13800138000',
        expect.stringMatching(/^\d{6}$/),
        300,
      );
    });

    it('应该拒绝 60 秒内重复发送', async () => {
      mockRedisService.hasVerificationCode.mockResolvedValue(true);

      await expect(service.sendCode('13800138000')).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('login', () => {
    it('应该自动注册新用户', async () => {
      const phone = '13900139000';
      const code = '123456';

      mockRedisService.getVerificationCode.mockResolvedValue(code);
      mockRedisService.deleteVerificationCode.mockResolvedValue(undefined);
      mockPrismaService.user.findUnique.mockResolvedValue(null);
      mockPrismaService.user.create.mockResolvedValue({
        id: 'user-id',
        phone,
        nickname: `用户9000`,
        avatar: null,
        level: 'REGULAR',
        points: 0,
        creditScore: 100,
      });
      mockJwtService.sign.mockReturnValue('fake-token');
      mockRedisService.setRefreshToken.mockResolvedValue(undefined);

      const result = await service.login({ phone, code });

      expect(result).toHaveProperty('accessToken');
      expect(result).toHaveProperty('refreshToken');
      expect(result.user.phone).toBe(phone);
      expect(mockPrismaService.user.create).toHaveBeenCalled();
    });

    it('应该拒绝错误的验证码', async () => {
      mockRedisService.getVerificationCode.mockResolvedValue('123456');

      await expect(
        service.login({ phone: '13900139000', code: '999999' }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('应该拒绝过期的验证码', async () => {
      mockRedisService.getVerificationCode.mockResolvedValue(null);

      await expect(
        service.login({ phone: '13900139000', code: '123456' }),
      ).rejects.toThrow(UnauthorizedException);
    });
  });

  // 添加更多测试用例...
});
```

---

### auth.e2e.spec.ts 模板

```typescript
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '@/app.module';
import { PrismaService } from '@prisma/prisma.service';
import { RedisService } from '@redis/redis.service';

describe('Auth API (e2e)', () => {
  let app: INestApplication;
  let prismaService: PrismaService;
  let redisService: RedisService;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    
    // 配置全局验证管道
    app.useGlobalPipes(new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }));
    
    // 配置全局路由前缀
    app.setGlobalPrefix('api');

    await app.init();

    prismaService = moduleFixture.get<PrismaService>(PrismaService);
    redisService = moduleFixture.get<RedisService>(RedisService);
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(async () => {
    // 清理测试数据
    await prismaService.user.deleteMany({
      where: { phone: { startsWith: '139' } },
    });
    // 清理 Redis 测试数据
    // await redisService.flushTestData();
  });

  describe('POST /api/auth/send-code', () => {
    // 添加测试用例（参考上面的清单）
  });

  describe('POST /api/auth/login', () => {
    // 添加测试用例
  });

  // 添加更多端点的测试...
});
```

---

## 🔧 测试环境配置

### 1. 安装测试依赖

```bash
cd backend
pnpm add -D @nestjs/testing supertest
```

### 2. 配置测试数据库

创建 `backend/.env.test`:

```env
# 测试数据库（独立于开发数据库）
DATABASE_URL="postgresql://user:password@localhost:5432/zenspace_test"

# 测试 Redis
REDIS_URL="redis://localhost:6379/1"

# JWT 配置
JWT_SECRET="test-jwt-secret-key"
JWT_REFRESH_SECRET="test-refresh-secret-key"
```

### 3. 配置 package.json

```json
{
  "scripts": {
    "test": "jest",
    "test:watch": "jest --watch",
    "test:cov": "jest --coverage",
    "test:e2e": "jest --config ./test/jest-e2e.json"
  }
}
```

---

## ✅ 验收标准

完成此 Ticket 需要满足以下条件：

### 1. 测试文件完整性
- [ ] `auth.service.spec.ts` 已创建，包含至少 10 个单元测试
- [ ] `auth.controller.spec.ts` 已创建
- [ ] `auth.e2e.spec.ts` 已创建，包含至少 18 个集成测试
- [ ] `redis.service.spec.ts` 已创建
- [ ] `prisma.service.spec.ts` 已创建

### 2. 测试通过
- [ ] 所有单元测试通过 (`pnpm run test`)
- [ ] 所有 E2E 测试通过 (`pnpm run test:e2e`)
- [ ] 测试覆盖率 ≥ 80% (`pnpm run test:cov`)

### 3. 测试用例覆盖
- [ ] 18+ 测试用例全部实现（参考上面的清单）
- [ ] Happy Path（正常流程）测试完整
- [ ] Unhappy Path（异常流程）测试完整
- [ ] 边界条件测试完整

### 4. 代码质量
- [ ] 测试代码符合命名规范
- [ ] 使用合适的 Mock 和 Spy
- [ ] 测试代码有清晰的注释（简体中文）
- [ ] 没有重复的测试逻辑

### 5. CI 集成（可选）
- [ ] GitHub Actions 配置自动运行测试
- [ ] 测试失败时阻止合并

---

## 📚 参考资料

### NestJS 测试文档
- [Testing - NestJS](https://docs.nestjs.com/fundamentals/testing)
- [E2E Testing - NestJS](https://docs.nestjs.com/fundamentals/testing#end-to-end-testing)

### Jest 文档
- [Jest - Getting Started](https://jestjs.io/docs/getting-started)
- [Mock Functions - Jest](https://jestjs.io/docs/mock-functions)

### 示例项目
- [NestJS Realworld Example](https://github.com/lujakob/nestjs-realworld-example-app)

---

## 🎯 TDD 工作流

虽然代码已经实现，但补充测试时也应该遵循以下流程：

### 步骤 1: 编写测试用例
```bash
# 选择一个功能，先写测试
vim backend/src/modules/auth/auth.service.spec.ts
```

### 步骤 2: 运行测试（红灯）
```bash
pnpm run test auth.service
# 测试应该通过，因为代码已经实现
```

### 步骤 3: 如果测试失败，修复代码
```bash
# 如果测试失败，说明代码有 bug，需要修复
vim backend/src/modules/auth/auth.service.ts
```

### 步骤 4: 重构优化
```bash
# 测试通过后，可以重构代码
# 确保重构后测试仍然通过
```

---

## 🚦 后续任务

完成测试后，需要同时修复 Code Review 中的其他问题：

1. **修复 JWT Secret 硬编码** (P1)
   - 移除 fallback 硬编码字符串
   - 环境变量缺失时抛出异常

2. **添加全局验证管道** (P2)
   - 在 `main.ts` 配置 `ValidationPipe`

3. **创建 .env.example** (P2)
   - 添加环境变量配置示例

完成以上所有任务后，Ticket-002 才算真正完成。

---

## 📝 提交规范

完成测试后，按照以下格式提交：

```bash
git add backend/src/modules/auth/*.spec.ts
git add backend/src/redis/*.spec.ts
git add backend/src/prisma/*.spec.ts
git add backend/test/

git commit -m "test(auth): 补充认证模块完整测试

- 添加 AuthService 单元测试（10+ 用例）
- 添加 AuthController 单元测试
- 添加 E2E 集成测试（18+ 用例）
- 添加 RedisService 和 PrismaService 测试
- 测试覆盖率达到 85%

Closes: Ticket-005
Refs: Ticket-002"
```

---

**创建人**: Architect (Antigravity)  
**创建时间**: 2026-01-25  
**优先级**: 🔥 P0 - 阻塞问题，必须立即完成
