import { Test, TestingModule } from '@nestjs/testing';
import { RedisService } from './redis.service';

/**
 * Redis 客户端 Mock 类型
 */
interface MockRedis {
  get: jest.Mock;
  set: jest.Mock;
  del: jest.Mock;
  exists: jest.Mock;
  on: jest.Mock;
  quit: jest.Mock;
}

/**
 * Redis 客户端 Mock
 */
const mockRedis: MockRedis = {
  get: jest.fn(),
  set: jest.fn(),
  del: jest.fn(),
  exists: jest.fn(),
  on: jest.fn(function (_: string, callback: () => void) {
    callback();
    return mockRedis;
  }),
  quit: jest.fn(),
};

// Mock ioredis 模块
jest.mock('ioredis', () => {
  return {
    __esModule: true,
    default: jest.fn(() => mockRedis),
  };
});

/**
 * RedisService 单元测试
 *
 * 测试 Redis 服务的功能
 */
describe('RedisService', () => {
  let service: RedisService;

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [RedisService],
    }).compile();

    service = module.get<RedisService>(RedisService);
  });

  describe('验证码管理', () => {
    /**
     * 测试用例 1.1: 成功存储验证码
     */
    it('应该成功存储验证码到 Redis', async () => {
      const phone = '13800138000';
      const code = '123456';
      const ttl = 300;

      mockRedis.set.mockResolvedValue('OK');

      await service.setVerificationCode(phone, code, ttl);

      expect(mockRedis.set).toHaveBeenCalledWith(
        `sms:code:${phone}`,
        code,
        'EX',
        ttl,
      );
    });

    /**
     * 测试用例 1.2: 成功获取验证码
     */
    it('应该成功从 Redis 获取验证码', async () => {
      const phone = '13800138001';
      const code = '654321';

      mockRedis.get.mockResolvedValue(code);

      const result = await service.getVerificationCode(phone);

      expect(result).toBe(code);
      expect(mockRedis.get).toHaveBeenCalledWith(`sms:code:${phone}`);
    });

    /**
     * 测试用例 1.3: 验证码不存在时返回 null
     */
    it('应该在验证码不存在时返回 null', async () => {
      const phone = '13800138002';

      mockRedis.get.mockResolvedValue(null);

      const result = await service.getVerificationCode(phone);

      expect(result).toBeNull();
    });

    /**
     * 测试用例 1.4: 成功删除验证码
     */
    it('应该成功删除验证码', async () => {
      const phone = '13800138003';

      mockRedis.del.mockResolvedValue(1);

      await service.deleteVerificationCode(phone);

      expect(mockRedis.del).toHaveBeenCalledWith(`sms:code:${phone}`);
    });

    /**
     * 测试用例 1.5: 检查验证码是否存在
     */
    it('应该正确检查验证码是否存在', async () => {
      const phone = '13800138004';

      // 验证码存在
      mockRedis.exists.mockResolvedValue(1);
      const exists1 = await service.hasVerificationCode(phone);
      expect(exists1).toBe(true);

      // 验证码不存在
      mockRedis.exists.mockResolvedValue(0);
      const exists2 = await service.hasVerificationCode(phone);
      expect(exists2).toBe(false);
    });
  });

  describe('Refresh Token 管理', () => {
    /**
     * 测试用例 2.1: 成功存储 Refresh Token
     */
    it('应该成功存储 Refresh Token 到 Redis', async () => {
      const userId = 'user-123';
      const refreshToken = 'refresh-token-abc';
      const ttl = 7 * 24 * 60 * 60; // 7 天

      mockRedis.set.mockResolvedValue('OK');

      await service.setRefreshToken(userId, refreshToken, ttl);

      expect(mockRedis.set).toHaveBeenCalledWith(
        `auth:refresh:${userId}`,
        refreshToken,
        'EX',
        ttl,
      );
    });

    /**
     * 测试用例 2.2: 成功获取 Refresh Token
     */
    it('应该成功从 Redis 获取 Refresh Token', async () => {
      const userId = 'user-456';
      const refreshToken = 'refresh-token-xyz';

      mockRedis.get.mockResolvedValue(refreshToken);

      const result = await service.getRefreshToken(userId);

      expect(result).toBe(refreshToken);
      expect(mockRedis.get).toHaveBeenCalledWith(`auth:refresh:${userId}`);
    });

    /**
     * 测试用例 2.3: Refresh Token 不存在时返回 null
     */
    it('应该在 Refresh Token 不存在时返回 null', async () => {
      const userId = 'user-789';

      mockRedis.get.mockResolvedValue(null);

      const result = await service.getRefreshToken(userId);

      expect(result).toBeNull();
    });

    /**
     * 测试用例 2.4: 成功删除 Refresh Token
     */
    it('应该成功删除 Refresh Token', async () => {
      const userId = 'user-101';

      mockRedis.del.mockResolvedValue(1);

      await service.deleteRefreshToken(userId);

      expect(mockRedis.del).toHaveBeenCalledWith(`auth:refresh:${userId}`);
    });
  });

  describe('Redis 连接管理', () => {
    /**
     * 测试用例 3.1: 模块销毁时关闭 Redis 连接
     */
    it('应该在模块销毁时关闭 Redis 连接', async () => {
      mockRedis.quit.mockResolvedValue('OK');

      await service.onModuleDestroy();

      expect(mockRedis.quit).toHaveBeenCalled();
    });

    /**
     * 测试用例 3.2: Redis 连接失败时抛出错误
     */
    it('应该在 Redis 连接失败时抛出错误', async () => {
      mockRedis.quit.mockRejectedValue(new Error('Redis connection error'));

      await expect(service.onModuleDestroy()).rejects.toThrow(
        'Redis connection error',
      );
    });
  });
});
