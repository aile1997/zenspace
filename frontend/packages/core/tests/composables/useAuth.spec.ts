/**
 * useAuth Composable 测试
 *
 * 测试覆盖：
 * 1. 发送验证码
 * 2. 验证码登录
 * 3. 微信登录
 * 4. 登出
 * 5. Token 刷新
 * 6. 异常处理
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { createPinia, setActivePinia } from 'pinia';
import { useAuth } from '@/composables/useAuth';
import { useUserStore } from '@/stores/user';
import { getAdapters } from '@/adapters';
import type { IHttp, IStorage } from '@/adapters';

// Mock adapters
vi.mock('@/adapters', () => ({
  getAdapters: vi.fn(),
}));

// Mock stores
vi.mock('@/stores/user', () => ({
  useUserStore: vi.fn(),
}));

describe('useAuth', () => {
  let mockHttp: IHttp;
  let mockStorage: IStorage;
  let mockUserStore: any;

  beforeEach(() => {
    // 初始化 Pinia
    setActivePinia(createPinia());

    vi.clearAllMocks();

    // 创建 Mock 适配器
    mockHttp = {
      get: vi.fn(),
      post: vi.fn(),
      put: vi.fn(),
      delete: vi.fn(),
    } as unknown as IHttp;

    mockStorage = {
      get: vi.fn(),
      set: vi.fn(),
      remove: vi.fn(),
      clear: vi.fn(),
    } as unknown as IStorage;

    // Mock getAdapters
    vi.mocked(getAdapters).mockReturnValue({ storage: mockStorage });

    // Mock userStore
    mockUserStore = {
      user: null,
      token: '',
      isAuthenticated: false,
      isVIP: false,
      login: vi.fn().mockImplementation(async (response: any) => {
        mockUserStore.user = response.user;
        mockUserStore.token = response.token;
        await mockStorage.set('user', response.user);
        await mockStorage.set('token', response.token);
      }),
      logout: vi.fn().mockImplementation(async () => {
        mockUserStore.user = null;
        mockUserStore.token = '';
        await mockStorage.remove('user');
        await mockStorage.remove('token');
      }),
      restore: vi.fn(),
    };

    vi.mocked(useUserStore).mockReturnValue(mockUserStore);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('sendSmsCode', () => {
    it('应该成功发送验证码', async () => {
      const mockResponse = { success: true, message: '验证码已发送' };
      vi.mocked(mockHttp.post).mockResolvedValue(mockResponse);

      const { sendSmsCode } = useAuth({ http: mockHttp, storage: mockStorage });

      await expect(sendSmsCode('13800138000')).resolves.not.toThrow();
      expect(mockHttp.post).toHaveBeenCalledWith('/auth/send-code', {
        phone: '13800138000',
      });
    });

    it('应该拒绝无效的手机号', async () => {
      const { sendSmsCode } = useAuth({ http: mockHttp, storage: mockStorage });

      await expect(sendSmsCode('12345')).rejects.toThrow('手机号格式不正确');
      expect(mockHttp.post).not.toHaveBeenCalled();
    });

    it('应该处理发送失败的情况', async () => {
      vi.mocked(mockHttp.post).mockRejectedValue(new Error('网络错误'));

      const { sendSmsCode } = useAuth({ http: mockHttp, storage: mockStorage });

      await expect(sendSmsCode('13800138000')).rejects.toThrow('网络错误');
    });
  });

  describe('smsLogin', () => {
    it('应该成功登录并保存用户信息', async () => {
      const mockResponse = {
        user: {
          id: 'user-123',
          phone: '13800138000',
          nickname: '测试用户',
          avatar: 'https://example.com/avatar.jpg',
          level: 'NORMAL' as const,
          points: 100,
          creditScore: 100,
        },
        token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9',
      };

      vi.mocked(mockHttp.post).mockResolvedValue(mockResponse);

      const { smsLogin } = useAuth({ http: mockHttp, storage: mockStorage });

      await smsLogin({ phone: '13800138000', code: '123456' });

      // 验证 HTTP 请求
      expect(mockHttp.post).toHaveBeenCalledWith('/auth/sms-login', {
        phone: '13800138000',
        code: '123456',
      });

      // 验证 store 调用
      expect(mockUserStore.login).toHaveBeenCalledWith(mockResponse);

      // 验证存储
      expect(mockStorage.set).toHaveBeenCalledWith('token', mockResponse.token);
      expect(mockStorage.set).toHaveBeenCalledWith('user', mockResponse.user);
    });

    it('应该处理验证码错误', async () => {
      vi.mocked(mockHttp.post).mockRejectedValue(new Error('验证码错误'));

      const { smsLogin } = useAuth({ http: mockHttp, storage: mockStorage });

      await expect(
        smsLogin({ phone: '13800138000', code: '000000' })
      ).rejects.toThrow('验证码错误');

      // 确保没有保存状态
      expect(mockUserStore.login).not.toHaveBeenCalled();
      expect(mockStorage.set).not.toHaveBeenCalled();
    });

    it('应该拒绝无效的验证码格式', async () => {
      const { smsLogin } = useAuth({ http: mockHttp, storage: mockStorage });

      await expect(
        smsLogin({ phone: '13800138000', code: '123' })
      ).rejects.toThrow('验证码格式不正确');
    });
  });

  describe('wechatLogin', () => {
    it('应该成功微信登录', async () => {
      const mockResponse = {
        user: {
          id: 'user-456',
          phone: '13800138000',
          nickname: '微信用户',
          avatar: 'https://example.com/wechat.jpg',
          level: 'VIP' as const,
          points: 500,
          creditScore: 100,
        },
        token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9',
      };

      vi.mocked(mockHttp.post).mockResolvedValue(mockResponse);

      const { wechatLogin } = useAuth({ http: mockHttp, storage: mockStorage });

      await wechatLogin({ code: 'wx_code_123' });

      expect(mockHttp.post).toHaveBeenCalledWith('/auth/wechat-login', {
        code: 'wx_code_123',
      });
      expect(mockUserStore.login).toHaveBeenCalledWith(mockResponse);
    });

    it('应该处理微信授权失败', async () => {
      vi.mocked(mockHttp.post).mockRejectedValue(new Error('微信授权失败'));

      const { wechatLogin } = useAuth({ http: mockHttp, storage: mockStorage });

      await expect(wechatLogin({ code: 'invalid_code' })).rejects.toThrow(
        '微信授权失败'
      );
    });
  });

  describe('logout', () => {
    it('应该成功登出并清除用户信息', async () => {
      vi.mocked(mockHttp.post).mockResolvedValue(undefined);

      const { logout } = useAuth({ http: mockHttp, storage: mockStorage });

      await logout();

      expect(mockUserStore.logout).toHaveBeenCalled();
      expect(mockStorage.remove).toHaveBeenCalledWith('token');
      expect(mockStorage.remove).toHaveBeenCalledWith('user');
    });
  });

  describe('refreshToken', () => {
    it('应该成功刷新 Token', async () => {
      const mockResponse = {
        token: 'new_token_here',
      };

      vi.mocked(mockHttp.post).mockResolvedValue(mockResponse);

      const { refreshToken } = useAuth({ http: mockHttp, storage: mockStorage });

      // 设置当前 token
      mockUserStore.token = 'old_token';

      await refreshToken();

      expect(mockHttp.post).toHaveBeenCalledWith('/auth/refresh', {
        token: 'old_token',
      });
      expect(mockStorage.set).toHaveBeenCalledWith('token', mockResponse.token);
    });

    it('应该处理刷新失败', async () => {
      vi.mocked(mockHttp.post).mockRejectedValue(new Error('Token 已过期'));

      const { refreshToken } = useAuth({ http: mockHttp, storage: mockStorage });

      await expect(refreshToken()).rejects.toThrow('Token 已过期');
    });
  });

  describe('计算属性', () => {
    it('isAuthenticated 应该反映登录状态', () => {
      mockUserStore.isAuthenticated = false;

      const { isAuthenticated } = useAuth({ http: mockHttp, storage: mockStorage });

      expect(isAuthenticated.value).toBe(false);
    });

    it('isVIP 应该反映用户等级', () => {
      mockUserStore.isVIP = true;

      const { isVIP } = useAuth({ http: mockHttp, storage: mockStorage });

      expect(isVIP.value).toBe(true);
    });

    it('user 应该返回当前用户信息', () => {
      const testUser = {
        id: 'user-123',
        phone: '13800138000',
        nickname: '测试用户',
        avatar: 'avatar.jpg',
        level: 'NORMAL' as const,
        points: 100,
        creditScore: 100,
      };

      mockUserStore.user = testUser;

      const { user } = useAuth({ http: mockHttp, storage: mockStorage });

      expect(user.value).toEqual(testUser);
    });
  });
});
