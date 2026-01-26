import { Test, TestingModule } from '@nestjs/testing';
import {
  INestApplication,
  ValidationPipe,
  ValidationError,
} from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';
import { RedisService } from '../src/redis/redis.service';

/**
 * 认证 API E2E 集成测试
 *
 * 测试完整的认证流程，包括所有 API 端点
 */
describe('Auth API (e2e)', () => {
  let app: INestApplication;
  let prismaService: PrismaService;
  let redisService: RedisService;

  // 测试用的手机号前缀（用于清理测试数据）
  // 注意：手机号必须是 11 位，格式为 1[3-9]后跟 9 位数字
  const TEST_PHONE_PREFIX = '139';

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();

    // 配置全局验证管道
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );

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
    // 清理测试数据（所有以 139 开头的手机号）
    await prismaService.user.deleteMany({
      where: {
        phone: {
          startsWith: TEST_PHONE_PREFIX,
        },
      },
    });

    // 注意：由于 Redis 的验证码有 60 秒冷却时间，
    // 测试中直接使用 send-code 接口可能会因为上一次测试的验证码未过期而失败
    // 解决方案：大多数测试预设验证码，只有少数测试真正调用 send-code
  });

  describe('POST /api/auth/send-code', () => {
    /**
     * 测试用例 1.1: 成功发送验证码
     */
    it('应该成功发送验证码', async () => {
      const phone = `${TEST_PHONE_PREFIX}01000001`;

      // 先清理 Redis 中可能存在的验证码
      await redisService.deleteVerificationCode(phone);

      const response = await request(app.getHttpServer())
        .post('/api/auth/send-code')
        .send({ phone })
        .expect(200);

      expect(response.body).toEqual({
        message: '验证码发送成功',
      });

      // 验证 Redis 中存储了验证码
      const code = await redisService.getVerificationCode(phone);
      expect(code).toMatch(/^\d{6}$/);
    });

    /**
     * 测试用例 1.2: 60 秒内重复发送返回 400
     */
    it('应该拒绝 60 秒内重复发送验证码', async () => {
      const phone = `${TEST_PHONE_PREFIX}01000002`;

      // 清理 Redis 中可能存在的验证码
      await redisService.deleteVerificationCode(phone);

      // 第一次发送成功
      await request(app.getHttpServer())
        .post('/api/auth/send-code')
        .send({ phone })
        .expect(200);

      // 第二次发送失败
      const response = await request(app.getHttpServer())
        .post('/api/auth/send-code')
        .send({ phone })
        .expect(400);

      expect(response.body.message).toContain('验证码已发送，请稍后再试');
    });

    /**
     * 测试用例 1.3: 手机号格式错误返回 400
     */
    it('应该拒绝无效的手机号格式', async () => {
      const invalidPhones = [
        '12345', // 太短
        '123456789012', // 太长
        '23800138000', // 不以 1 开头
        'abc', // 非数字
      ];

      for (const phone of invalidPhones) {
        await request(app.getHttpServer())
          .post('/api/auth/send-code')
          .send({ phone })
          .expect(400);
      }
    });
  });

  describe('POST /api/auth/login', () => {
    /**
     * 测试用例 2.1: 验证码正确，首次登录自动注册
     */
    it('应该自动注册新用户并返回 Token', async () => {
      const phone = `${TEST_PHONE_PREFIX}02000001`;
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
        nickname: `用户${phone.slice(-4)}`,
        level: 'NORMAL',
        points: 0,
        creditScore: 100,
      });

      // 验证用户已创建
      const user = await prismaService.user.findUnique({
        where: { phone },
      });
      expect(user).not.toBeNull();
    });

    /**
     * 测试用例 2.2: 验证码正确，已有用户正常登录
     */
    it('应该让已存在用户成功登录', async () => {
      const phone = `${TEST_PHONE_PREFIX}02000002`;
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

    /**
     * 测试用例 2.3: 验证码错误返回 401
     */
    it('应该拒绝错误的验证码', async () => {
      const phone = `${TEST_PHONE_PREFIX}02000003`;
      const storedCode = '123456';

      await redisService.setVerificationCode(phone, storedCode);

      const response = await request(app.getHttpServer())
        .post('/api/auth/login')
        .send({ phone, code: '999999' }) // 错误的验证码
        .expect(401);

      expect(response.body.message).toContain('验证码错误');
    });

    /**
     * 测试用例 2.4: 验证码过期返回 401
     */
    it('应该拒绝过期的验证码', async () => {
      const phone = `${TEST_PHONE_PREFIX}02000004`;

      const response = await request(app.getHttpServer())
        .post('/api/auth/login')
        .send({ phone, code: '123456' })
        .expect(401);

      expect(response.body.message).toContain('验证码已过期');
    });

    /**
     * 测试用例 2.5: 手机号格式错误返回 400
     */
    it('应该拒绝无效的手机号格式', async () => {
      await request(app.getHttpServer())
        .post('/api/auth/login')
        .send({ phone: 'invalid', code: '123456' })
        .expect(400);
    });
  });

  describe('POST /api/auth/refresh', () => {
    /**
     * 测试用例 3.1: Refresh Token 有效，返回新 Access Token
     */
    it('应该返回新的 Access Token', async () => {
      const phone = `${TEST_PHONE_PREFIX}03000001`;
      const code = '123456';

      // 先登录获取 Refresh Token
      await redisService.setVerificationCode(phone, code);

      const loginResponse = await request(app.getHttpServer())
        .post('/api/auth/login')
        .send({ phone, code })
        .expect(200);

      const refreshToken = loginResponse.body.refreshToken;

      // 使用 Refresh Token 获取新 Access Token
      const response = await request(app.getHttpServer())
        .post('/api/auth/refresh')
        .send({ refreshToken })
        .expect(200);

      expect(response.body).toHaveProperty('accessToken');
    });

    /**
     * 测试用例 3.2: Refresh Token 无效返回 401
     */
    it('应该拒绝无效的 Refresh Token', async () => {
      const fakeToken = 'invalid.refresh.token';

      await request(app.getHttpServer())
        .post('/api/auth/refresh')
        .send({ refreshToken: fakeToken })
        .expect(401);
    });

    /**
     * 测试用例 3.3: Refresh Token 已登出返回 401
     */
    it('应该拒绝已登出的 Refresh Token', async () => {
      const phone = `${TEST_PHONE_PREFIX}03000002`;
      const code = '123456';

      // 登录
      await redisService.setVerificationCode(phone, code);

      const loginResponse = await request(app.getHttpServer())
        .post('/api/auth/login')
        .send({ phone, code })
        .expect(200);

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
  });

  describe('POST /api/auth/logout', () => {
    /**
     * 测试用例 4.1: 成功登出，删除 Refresh Token
     */
    it('应该成功登出并删除 Refresh Token', async () => {
      const phone = `${TEST_PHONE_PREFIX}04000001`;
      const code = '123456';

      // 登录
      await redisService.setVerificationCode(phone, code);

      const loginResponse = await request(app.getHttpServer())
        .post('/api/auth/login')
        .send({ phone, code })
        .expect(200);

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

    /**
     * 测试用例 4.2: 未认证用户登出返回 401
     */
    it('应该拒绝未认证用户的登出请求', async () => {
      await request(app.getHttpServer())
        .post('/api/auth/logout')
        .expect(401);
    });
  });

  describe('GET /api/auth/profile', () => {
    /**
     * 测试用例 5.1: 已认证用户获取信息成功
     */
    it('应该返回当前用户信息', async () => {
      const phone = `${TEST_PHONE_PREFIX}05000001`;
      const code = '123456';

      // 登录
      await redisService.setVerificationCode(phone, code);

      const loginResponse = await request(app.getHttpServer())
        .post('/api/auth/login')
        .send({ phone, code })
        .expect(200);

      const accessToken = loginResponse.body.accessToken;

      // 获取用户信息
      const response = await request(app.getHttpServer())
        .get('/api/auth/profile')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(response.body).toMatchObject({
        phone,
        nickname: expect.stringContaining('0001'),
        level: 'NORMAL',
      });
    });

    /**
     * 测试用例 5.2: 未认证用户返回 401
     */
    it('应该拒绝未认证用户的请求', async () => {
      await request(app.getHttpServer())
        .get('/api/auth/profile')
        .expect(401);
    });
  });

  describe('PUT /api/auth/update-profile', () => {
    /**
     * 测试用例 6.1: 更新昵称成功
     */
    it('应该成功更新用户昵称', async () => {
      const phone = `${TEST_PHONE_PREFIX}06000001`;
      const code = '123456';

      // 登录
      await redisService.setVerificationCode(phone, code);

      const loginResponse = await request(app.getHttpServer())
        .post('/api/auth/login')
        .send({ phone, code })
        .expect(200);

      const accessToken = loginResponse.body.accessToken;

      // 更新昵称
      const response = await request(app.getHttpServer())
        .put('/api/auth/update-profile')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ nickname: '新昵称' })
        .expect(200);

      expect(response.body.nickname).toBe('新昵称');
    });

    /**
     * 测试用例 6.2: 更新头像成功
     */
    it('应该成功更新用户头像', async () => {
      const phone = `${TEST_PHONE_PREFIX}06000002`;
      const code = '123456';

      // 登录
      await redisService.setVerificationCode(phone, code);

      const loginResponse = await request(app.getHttpServer())
        .post('/api/auth/login')
        .send({ phone, code })
        .expect(200);

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

    /**
     * 测试用例 6.3: 未认证用户返回 401
     */
    it('应该拒绝未认证用户的请求', async () => {
      await request(app.getHttpServer())
        .put('/api/auth/update-profile')
        .send({ nickname: '新昵称' })
        .expect(401);
    });
  });

  describe('完整认证流程', () => {
    /**
     * 测试用例 7.1: 完整的登录 → 获取信息 → 更新信息 → 登出流程
     */
    it('应该成功完成完整的用户认证流程', async () => {
      const phone = `${TEST_PHONE_PREFIX}07000001`;

      // 清理 Redis 中可能存在的验证码
      await redisService.deleteVerificationCode(phone);

      // 1. 发送验证码
      await request(app.getHttpServer())
        .post('/api/auth/send-code')
        .send({ phone })
        .expect(200);

      // 2. 获取生成的验证码
      const code = await redisService.getVerificationCode(phone);
      expect(code).toBeTruthy();

      // 3. 登录
      const loginResponse = await request(app.getHttpServer())
        .post('/api/auth/login')
        .send({ phone, code })
        .expect(200);

      const { accessToken, refreshToken, user } = loginResponse.body;

      expect(accessToken).toBeTruthy();
      expect(refreshToken).toBeTruthy();
      expect(user.phone).toBe(phone);

      // 3. 获取用户信息
      const profileResponse = await request(app.getHttpServer())
        .get('/api/auth/profile')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(profileResponse.body.id).toBe(user.id);

      // 4. 更新用户信息
      const updateResponse = await request(app.getHttpServer())
        .put('/api/auth/update-profile')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ nickname: '更新后的昵称' })
        .expect(200);

      expect(updateResponse.body.nickname).toBe('更新后的昵称');

      // 5. 登出
      const logoutResponse = await request(app.getHttpServer())
        .post('/api/auth/logout')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(logoutResponse.body.message).toBe('登出成功');

      // 注意：JWT access token 是无状态的，登出后仍然有效直到过期（1小时）
      // 这符合 JWT 标准行为。Refresh token 已被删除，无法刷新 access token
      // Refresh token 失效的验证在其他测试用例中覆盖
    });

    /**
     * 测试用例 7.2: Token 过期后使用 Refresh Token 获取新 Token
     */
    it('应该支持使用 Refresh Token 刷新 Access Token', async () => {
      const phone = `${TEST_PHONE_PREFIX}07000002`;
      const code = '123456';

      // 1. 登录
      await redisService.setVerificationCode(phone, code);

      const loginResponse = await request(app.getHttpServer())
        .post('/api/auth/login')
        .send({ phone, code })
        .expect(200);

      const { refreshToken, user } = loginResponse.body;

      // 2. 模拟 Token 过期（等待 1 秒）
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // 3. 使用 Refresh Token 获取新 Access Token
      const refreshResponse = await request(app.getHttpServer())
        .post('/api/auth/refresh')
        .send({ refreshToken })
        .expect(200);

      const newAccessToken = refreshResponse.body.accessToken;

      // 4. 使用新 Token 访问受保护的资源
      await request(app.getHttpServer())
        .get('/api/auth/profile')
        .set('Authorization', `Bearer ${newAccessToken}`)
        .expect(200);
    });
  });
});
