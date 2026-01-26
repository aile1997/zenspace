import { JwtStrategy } from './jwt.strategy';
import { UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '@prisma/prisma.service';

/**
 * JWT Strategy 单元测试
 *
 * 测试 JWT 认证策略
 */
describe('JwtStrategy', () => {
  let strategy: JwtStrategy;
  let prisma: jest.Mocked<PrismaService>;

  // Mock PrismaService
  const mockPrismaService = {
    user: {
      findUnique: jest.fn(),
    },
  } as unknown as jest.Mocked<PrismaService>;

  beforeEach(() => {
    strategy = new JwtStrategy(mockPrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('validate', () => {
    /**
     * 测试用例 1.1: 用户存在，验证成功
     */
    it('应该成功验证并返回用户信息', async () => {
      const payload = { sub: 'user-123', phone: '13800138000' };
      const user = {
        id: 'user-123',
        phone: '13800138000',
        nickname: '测试用户',
        avatar: null,
        level: 'NORMAL',
        points: 0,
        creditScore: 100,
      };

      mockPrismaService.user.findUnique = jest.fn().mockResolvedValue(user);

      const result = await strategy.validate(payload);

      expect(result).toEqual(user);
      expect(mockPrismaService.user.findUnique).toHaveBeenCalledWith({
        where: { id: 'user-123' },
        select: {
          id: true,
          phone: true,
          nickname: true,
          avatar: true,
          level: true,
          points: true,
          creditScore: true,
          createdAt: true,
        },
      });
    });

    /**
     * 测试用例 1.2: 用户不存在，抛出 401
     */
    it('应该在用户不存在时抛出 401', async () => {
      const payload = { sub: 'non-existent-user', phone: '13800138000' };

      mockPrismaService.user.findUnique = jest.fn().mockResolvedValue(null);

      await expect(strategy.validate(payload)).rejects.toThrow(
        new UnauthorizedException('用户不存在'),
      );

      expect(mockPrismaService.user.findUnique).toHaveBeenCalledWith({
        where: { id: 'non-existent-user' },
        select: expect.anything(),
      });
    });

    /**
     * 测试用例 1.3: 数据库异常，抛出错误
     */
    it('应该在数据库异常时抛出错误', async () => {
      const payload = { sub: 'user-123', phone: '13800138000' };

      mockPrismaService.user.findUnique = jest
        .fn()
        .mockRejectedValue(new Error('Database connection failed'));

      await expect(strategy.validate(payload)).rejects.toThrow(
        'Database connection failed',
      );
    });
  });
});
