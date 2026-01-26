import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { UnauthorizedException, BadRequestException } from '@nestjs/common';

/**
 * AuthController 单元测试
 *
 * 测试认证控制器的 HTTP 层逻辑
 */
describe('AuthController', () => {
  let controller: AuthController;
  let authService: jest.Mocked<AuthService>;

  // Mock AuthService
  const mockAuthService = {
    sendCode: jest.fn(),
    login: jest.fn(),
    refreshTokens: jest.fn(),
    logout: jest.fn(),
    getProfile: jest.fn(),
    updateProfile: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: mockAuthService,
        },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<AuthController>(AuthController);
    authService = module.get(AuthService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('sendCode', () => {
    /**
     * 测试用例 1.1: 成功发送验证码
     */
    it('应该成功发送验证码', async () => {
      mockAuthService.sendCode.mockResolvedValue({ message: '验证码发送成功' });

      const result = await controller.sendCode({ phone: '13800138000' });

      expect(result).toEqual({ message: '验证码发送成功' });
      expect(mockAuthService.sendCode).toHaveBeenCalledWith('13800138000');
    });
  });

  describe('login', () => {
    /**
     * 测试用例 2.1: 登录成功
     */
    it('应该成功登录并返回 Token', async () => {
      const authResponse = {
        accessToken: 'access-token',
        refreshToken: 'refresh-token',
        user: {
          id: 'user-123',
          phone: '13800138000',
          nickname: '用户8000',
          avatar: null,
          level: 'NORMAL',
          points: 0,
          creditScore: 100,
        },
      };

      mockAuthService.login.mockResolvedValue(authResponse);

      const result = await controller.login({
        phone: '13800138000',
        code: '123456',
      });

      expect(result).toEqual(authResponse);
      expect(mockAuthService.login).toHaveBeenCalledWith({
        phone: '13800138000',
        code: '123456',
      });
    });
  });

  describe('logout', () => {
    /**
     * 测试用例 3.1: 登出成功
     */
    it('应该成功登出', async () => {
      const mockUser = {
        id: 'user-123',
        phone: '13800138000',
        nickname: '用户',
        avatar: null,
        level: 'NORMAL' as const,
        points: 0,
        creditScore: 100,
      };
      mockAuthService.logout.mockResolvedValue({ message: '登出成功' });

      const result = await controller.logout(mockUser);

      expect(result).toEqual({ message: '登出成功' });
      expect(mockAuthService.logout).toHaveBeenCalledWith('user-123');
    });
  });

  describe('refreshTokens', () => {
    /**
     * 测试用例 4.1: 刷新 Token 成功
     */
    it('应该成功刷新 Access Token', async () => {
      mockAuthService.refreshTokens.mockResolvedValue({
        accessToken: 'new-access-token',
      });

      const result = await controller.refresh({
        refreshToken: 'valid-refresh-token',
      });

      expect(result).toEqual({ accessToken: 'new-access-token' });
      expect(mockAuthService.refreshTokens).toHaveBeenCalledWith(
        'valid-refresh-token',
      );
    });
  });

  describe('getProfile', () => {
    /**
     * 测试用例 5.1: 获取用户信息成功
     */
    it('应该返回当前用户信息', async () => {
      const mockUser = {
        id: 'user-123',
        phone: '13800138000',
        nickname: '测试用户',
        avatar: 'https://example.com/avatar.jpg',
        level: 'VIP' as const,
        points: 100,
        creditScore: 95,
      };

      mockAuthService.getProfile.mockResolvedValue(mockUser);

      const result = await controller.getProfile(mockUser);

      expect(result).toEqual(mockUser);
      expect(mockAuthService.getProfile).toHaveBeenCalledWith('user-123');
    });
  });

  describe('updateProfile', () => {
    /**
     * 测试用例 6.1: 更新昵称成功
     */
    it('应该成功更新用户昵称', async () => {
      const mockUser = {
        id: 'user-123',
        phone: '13800138000',
        nickname: '用户',
        avatar: null,
        level: 'NORMAL' as const,
        points: 0,
        creditScore: 100,
      };
      const updatedUser = {
        id: 'user-123',
        phone: '13800138000',
        nickname: '新昵称',
        avatar: null,
        level: 'NORMAL' as const,
        points: 0,
        creditScore: 100,
      };

      mockAuthService.updateProfile.mockResolvedValue(updatedUser);

      const result = await controller.updateProfile(mockUser, {
        nickname: '新昵称',
      });

      expect(result.nickname).toBe('新昵称');
      expect(mockAuthService.updateProfile).toHaveBeenCalledWith('user-123', {
        nickname: '新昵称',
      });
    });

    /**
     * 测试用例 6.2: 更新头像成功
     */
    it('应该成功更新用户头像', async () => {
      const mockUser = {
        id: 'user-123',
        phone: '13800138000',
        nickname: '用户',
        avatar: null,
        level: 'NORMAL' as const,
        points: 0,
        creditScore: 100,
      };
      const avatarUrl = 'https://example.com/new-avatar.jpg';
      const updatedUser = {
        id: 'user-123',
        phone: '13800138000',
        nickname: '用户',
        avatar: avatarUrl,
        level: 'NORMAL' as const,
        points: 0,
        creditScore: 100,
      };

      mockAuthService.updateProfile.mockResolvedValue(updatedUser);

      const result = await controller.updateProfile(mockUser, {
        avatar: avatarUrl,
      });

      expect(result.avatar).toBe(avatarUrl);
      expect(mockAuthService.updateProfile).toHaveBeenCalledWith('user-123', {
        avatar: avatarUrl,
      });
    });

    /**
     * 测试用例 6.3: 同时更新昵称和头像
     */
    it('应该成功同时更新昵称和头像', async () => {
      const mockUser = {
        id: 'user-123',
        phone: '13800138000',
        nickname: '用户',
        avatar: null,
        level: 'NORMAL' as const,
        points: 0,
        creditScore: 100,
      };
      const updateData = {
        nickname: '更新的昵称',
        avatar: 'https://example.com/avatar.jpg',
      };
      const updatedUser = {
        id: 'user-123',
        phone: '13800138000',
        ...updateData,
        level: 'NORMAL' as const,
        points: 0,
        creditScore: 100,
      };

      mockAuthService.updateProfile.mockResolvedValue(updatedUser);

      const result = await controller.updateProfile(mockUser, updateData);

      expect(result.nickname).toBe(updateData.nickname);
      expect(result.avatar).toBe(updateData.avatar);
      expect(mockAuthService.updateProfile).toHaveBeenCalledWith(
        'user-123',
        updateData,
      );
    });
  });
});
