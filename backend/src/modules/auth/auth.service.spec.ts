import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { PrismaService } from '@prisma/prisma.service';
import { RedisService } from '@redis/redis.service';
import { JwtService } from '@nestjs/jwt';
import { UnauthorizedException, BadRequestException } from '@nestjs/common';
import { LoginDto } from './dto/login.dto';

/**
 * AuthService 单元测试
 *
 * 测试认证服务的核心业务逻辑
 */
describe('AuthService', () => {
  let service: AuthService;
  let prisma: PrismaService;
  let redis: RedisService;
  let jwt: JwtService;

  // Mock PrismaService
  const mockPrismaService = {
    user: {
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
  };

  // Mock RedisService
  const mockRedisService = {
    hasVerificationCode: jest.fn(),
    setVerificationCode: jest.fn(),
    getVerificationCode: jest.fn(),
    deleteVerificationCode: jest.fn(),
    setRefreshToken: jest.fn(),
    getRefreshToken: jest.fn(),
    deleteRefreshToken: jest.fn(),
  };

  // Mock JwtService
  const mockJwtService = {
    sign: jest.fn().mockReturnValue('mock-jwt-token'),
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
    /**
     * 测试用例 1.1: 成功发送验证码
     */
    it('应该成功发送 6 位数字验证码', async () => {
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

    /**
     * 测试用例 1.2: 60 秒内重复发送返回错误
     */
    it('应该拒绝 60 秒内重复发送验证码', async () => {
      mockRedisService.hasVerificationCode.mockResolvedValue(true);

      await expect(service.sendCode('13800138001')).rejects.toThrow(
        new BadRequestException('验证码已发送，请稍后再试'),
      );
      expect(mockRedisService.setVerificationCode).not.toHaveBeenCalled();
    });

    /**
     * 测试用例 1.3: Redis 服务异常时抛出错误
     */
    it('应该在 Redis 服务异常时抛出错误', async () => {
      mockRedisService.hasVerificationCode.mockRejectedValue(
        new Error('Redis connection failed'),
      );

      await expect(service.sendCode('13800138002')).rejects.toThrow(
        'Redis connection failed',
      );
    });
  });

  describe('login', () => {
    /**
     * 测试用例 2.1: 验证码正确，首次登录自动注册
     */
    it('应该自动注册新用户并返回 Token', async () => {
      const phone = '13900139000';
      const code = '123456';

      mockRedisService.getVerificationCode.mockResolvedValue(code);
      mockRedisService.deleteVerificationCode.mockResolvedValue(undefined);
      mockPrismaService.user.findUnique.mockResolvedValue(null);
      mockPrismaService.user.create.mockResolvedValue({
        id: 'user-id-1',
        phone,
        nickname: '用户9000',
        avatar: null,
        level: 'NORMAL',
        points: 0,
        creditScore: 100,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      mockJwtService.sign.mockReturnValue('fake-access-token');
      mockRedisService.setRefreshToken.mockResolvedValue(undefined);

      const result = await service.login({ phone, code } as LoginDto);

      expect(result).toHaveProperty('accessToken');
      expect(result).toHaveProperty('refreshToken');
      expect(result.user.phone).toBe(phone);
      expect(result.user.nickname).toBe('用户9000');
      expect(mockPrismaService.user.create).toHaveBeenCalled();
      expect(mockRedisService.deleteVerificationCode).toHaveBeenCalledWith(
        phone,
      );
    });

    /**
     * 测试用例 2.2: 验证码正确，已有用户正常登录
     */
    it('应该让已存在用户成功登录', async () => {
      const phone = '13900139001';
      const code = '654321';

      const existingUser = {
        id: 'user-id-2',
        phone,
        nickname: '老用户',
        avatar: null,
        level: 'VIP',
        points: 100,
        creditScore: 95,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockRedisService.getVerificationCode.mockResolvedValue(code);
      mockRedisService.deleteVerificationCode.mockResolvedValue(undefined);
      mockPrismaService.user.findUnique.mockResolvedValue(existingUser);
      mockJwtService.sign.mockReturnValue('fake-access-token');
      mockRedisService.setRefreshToken.mockResolvedValue(undefined);

      const result = await service.login({ phone, code } as LoginDto);

      expect(result.user.nickname).toBe('老用户');
      expect(result.user.level).toBe('VIP');
      expect(mockPrismaService.user.create).not.toHaveBeenCalled();
    });

    /**
     * 测试用例 2.3: 验证码错误返回 401
     */
    it('应该拒绝错误的验证码', async () => {
      const phone = '13900139002';
      const storedCode = '123456';
      const wrongCode = '999999';

      mockRedisService.getVerificationCode.mockResolvedValue(storedCode);

      await expect(
        service.login({ phone, code: wrongCode } as LoginDto),
      ).rejects.toThrow(new UnauthorizedException('验证码错误'));
    });

    /**
     * 测试用例 2.4: 验证码过期返回 401
     */
    it('应该拒绝过期的验证码', async () => {
      const phone = '13900139003';

      mockRedisService.getVerificationCode.mockResolvedValue(null);

      await expect(
        service.login({ phone, code: '123456' } as LoginDto),
      ).rejects.toThrow(new UnauthorizedException('验证码已过期'));
    });

    /**
     * 测试用例 2.5: 数据库异常时抛出错误
     */
    it('应该在数据库异常时抛出错误', async () => {
      const phone = '13900139004';
      const code = '123456';

      mockRedisService.getVerificationCode.mockResolvedValue(code);
      mockPrismaService.user.findUnique.mockRejectedValue(
        new Error('Database connection failed'),
      );

      await expect(service.login({ phone, code } as LoginDto)).rejects.toThrow(
        'Database connection failed',
      );
    });
  });

  describe('refreshTokens', () => {
    /**
     * 测试用例 3.1: Refresh Token 有效，返回新 Access Token
     */
    it('应该返回新的 Access Token', async () => {
      const refreshToken = 'valid-refresh-token';
      const payload = { sub: 'user-123', phone: '13900139005' };

      mockJwtService.verify.mockReturnValue(payload);
      mockRedisService.getRefreshToken.mockResolvedValue(refreshToken);
      mockJwtService.sign.mockReturnValue('new-access-token');

      const result = await service.refreshTokens(refreshToken);

      expect(result).toEqual({ accessToken: 'new-access-token' });
      expect(mockJwtService.verify).toHaveBeenCalledWith(refreshToken);
      expect(mockJwtService.sign).toHaveBeenCalledWith({
        sub: payload.sub,
        phone: payload.phone,
      });
    });

    /**
     * 测试用例 3.2: Refresh Token 无效返回 401
     */
    it('应该拒绝无效的 Refresh Token', async () => {
      const fakeToken = 'invalid.refresh.token';

      mockJwtService.verify.mockImplementation(() => {
        throw new Error('Invalid token');
      });

      await expect(service.refreshTokens(fakeToken)).rejects.toThrow(
        new UnauthorizedException('刷新令牌无效'),
      );
    });

    /**
     * 测试用例 3.3: Refresh Token 已过期返回 401
     */
    it('应该拒绝已过期的 Refresh Token', async () => {
      const expiredToken = 'expired.refresh.token';
      const payload = { sub: 'user-123', phone: '13900139006' };

      mockRedisService.getRefreshToken.mockResolvedValue(null);
      mockJwtService.verify.mockReturnValue(payload);

      await expect(service.refreshTokens(expiredToken)).rejects.toThrow(
        new UnauthorizedException('刷新令牌已过期'),
      );
    });
  });

  describe('logout', () => {
    /**
     * 测试用例 4.1: 成功登出
     */
    it('应该成功登出并删除 Refresh Token', async () => {
      const userId = 'user-123';

      mockRedisService.deleteRefreshToken.mockResolvedValue(undefined);

      const result = await service.logout(userId);

      expect(result).toEqual({ message: '登出成功' });
      expect(mockRedisService.deleteRefreshToken).toHaveBeenCalledWith(userId);
    });

    /**
     * 测试用例 4.2: Redis 异常时抛出错误
     */
    it('应该在 Redis 异常时抛出错误', async () => {
      const userId = 'user-456';

      mockRedisService.deleteRefreshToken.mockRejectedValue(
        new Error('Redis connection failed'),
      );

      await expect(service.logout(userId)).rejects.toThrow(
        'Redis connection failed',
      );
    });
  });

  describe('getProfile', () => {
    /**
     * 测试用例 5.1: 成功获取用户信息
     */
    it('应该返回用户信息', async () => {
      const userId = 'user-789';
      const user = {
        id: userId,
        phone: '13900139007',
        nickname: '测试用户',
        avatar: 'https://example.com/avatar.jpg',
        level: 'NORMAL',
        points: 50,
        creditScore: 98,
        createdAt: new Date(),
      };

      mockPrismaService.user.findUnique.mockResolvedValue(user);

      const result = await service.getProfile(userId);

      expect(result).toEqual(user);
      expect(mockPrismaService.user.findUnique).toHaveBeenCalledWith({
        where: { id: userId },
        select: expect.anything(),
      });
    });

    /**
     * 测试用例 5.2: 用户不存在返回 401
     */
    it('应该在用户不存在时抛出错误', async () => {
      const userId = 'non-existent-user';

      mockPrismaService.user.findUnique.mockResolvedValue(null);

      await expect(service.getProfile(userId)).rejects.toThrow(
        new UnauthorizedException('用户不存在'),
      );
    });

    /**
     * 测试用例 5.3: 数据库异常时抛出错误
     */
    it('应该在数据库异常时抛出错误', async () => {
      const userId = 'user-error';

      mockPrismaService.user.findUnique.mockRejectedValue(
        new Error('Database connection failed'),
      );

      await expect(service.getProfile(userId)).rejects.toThrow(
        'Database connection failed',
      );
    });
  });

  describe('updateProfile', () => {
    /**
     * 测试用例 6.1: 成功更新昵称
     */
    it('应该成功更新用户昵称', async () => {
      const userId = 'user-101';
      const updateData = { nickname: '新昵称' };
      const updatedUser = {
        id: userId,
        phone: '13900139008',
        nickname: '新昵称',
        avatar: null,
        level: 'NORMAL',
        points: 0,
        creditScore: 100,
        createdAt: new Date(),
      };

      mockPrismaService.user.update.mockResolvedValue(updatedUser);

      const result = await service.updateProfile(userId, updateData);

      expect(result.nickname).toBe('新昵称');
      expect(mockPrismaService.user.update).toHaveBeenCalledWith({
        where: { id: userId },
        data: updateData,
        select: expect.anything(),
      });
    });

    /**
     * 测试用例 6.2: 成功更新头像
     */
    it('应该成功更新用户头像', async () => {
      const userId = 'user-102';
      const avatarUrl = 'https://example.com/new-avatar.jpg';
      const updateData = { avatar: avatarUrl };
      const updatedUser = {
        id: userId,
        phone: '13900139009',
        nickname: '用户',
        avatar: avatarUrl,
        level: 'NORMAL',
        points: 0,
        creditScore: 100,
        createdAt: new Date(),
      };

      mockPrismaService.user.update.mockResolvedValue(updatedUser);

      const result = await service.updateProfile(userId, updateData);

      expect(result.avatar).toBe(avatarUrl);
    });

    /**
     * 测试用例 6.3: 数据库异常时抛出错误
     */
    it('应该在数据库异常时抛出错误', async () => {
      const userId = 'user-error';

      mockPrismaService.user.update.mockRejectedValue(
        new Error('Database connection failed'),
      );

      await expect(
        service.updateProfile(userId, { nickname: '测试' }),
      ).rejects.toThrow('Database connection failed');
    });
  });

  describe('generateTokens (私有方法)', () => {
    /**
     * 测试用例 7.1: 生成 Access Token 和 Refresh Token
     */
    it('应该生成 Access Token 和 Refresh Token', () => {
      const userId = 'user-token';
      const phone = '13900139010';

      mockJwtService.sign.mockReturnValue('token');

      service['generateTokens'](userId, phone);

      expect(mockJwtService.sign).toHaveBeenCalledTimes(2);
      // 第一次调用生成 Access Token
      expect(mockJwtService.sign).toHaveBeenCalledWith(
        { sub: userId, phone },
        { expiresIn: '1h' },
      );
      // 第二次调用生成 Refresh Token
      expect(mockJwtService.sign).toHaveBeenCalledWith(
        { sub: userId, phone },
        {
          secret: process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET,
          expiresIn: '7d',
        },
      );
    });
  });
});
