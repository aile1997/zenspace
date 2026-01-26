/**
 * UniApp 平台适配器实现
 *
 * 实现核心层定义的适配器接口
 * 提供对 uni API 的封装
 */
import type { IStorage, IHttp } from '@zenspace/core/adapters';

/**
 * UniApp 存储适配器
 * 封装 uni.getStorageSync / uni.setStorageSync
 */
export class UniStorage implements IStorage {
  async get<T>(key: string): Promise<T | null> {
    try {
      const value = uni.getStorageSync(key);
      return value ? JSON.parse(value) : null;
    } catch {
      return null;
    }
  }

  async set<T>(key: string, value: T): Promise<void> {
    uni.setStorageSync(key, JSON.stringify(value));
  }

  async remove(key: string): Promise<void> {
    uni.removeStorageSync(key);
  }

  async clear(): Promise<void> {
    uni.clearStorageSync();
  }
}

/**
 * UniApp HTTP 适配器
 * 封装 uni.request
 */
export class UniHttp implements IHttp {
  private baseURL: string;
  private token: string = '';

  constructor(baseURL: string) {
    this.baseURL = baseURL;
  }

  private async request<T>(
    method: 'GET' | 'POST' | 'PUT' | 'DELETE',
    url: string,
    data?: unknown
  ): Promise<T> {
    const fullUrl = this.baseURL + url;

    // 获取 Token
    const token = uni.getStorageSync('token') || this.token;

    return new Promise<T>((resolve, reject) => {
      uni.request({
        url: fullUrl,
        method,
        data: data as Record<string, unknown>,
        header: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        success: (res) => {
          if (res.statusCode >= 200 && res.statusCode < 300) {
            resolve(res.data as T);
          } else if (res.statusCode === 401) {
            // Token 过期或未登录，清除登录信息
            uni.removeStorageSync('token');
            uni.removeStorageSync('refreshToken');
            uni.removeStorageSync('user');

            // 重定向到登录页
            uni.reLaunch({
              url: '/pages/login/index',
            });

            reject(new Error('登录已过期，请重新登录'));
          } else if (res.statusCode === 500) {
            // 服务器错误
            console.error('[UniHttp] 服务器错误:', res.data);
            reject(new Error('服务器错误，请稍后重试'));
          } else {
            reject(new Error((res.data as any)?.message || '请求失败'));
          }
        },
        fail: (err) => {
          console.error('[UniHttp] 网络错误:', err);
          reject(new Error(err.errMsg || '网络请求失败'));
        },
      });
    });
  }

  get<T>(url: string, params?: Record<string, unknown>): Promise<T> {
    return this.request<T>('GET', url, params);
  }

  post<T>(url: string, data?: unknown): Promise<T> {
    return this.request<T>('POST', url, data);
  }

  put<T>(url: string, data?: unknown): Promise<T> {
    return this.request<T>('PUT', url, data);
  }

  delete<T>(url: string): Promise<T> {
    return this.request<T>('DELETE', url);
  }

  setAuthToken(token: string): void {
    this.token = token;
  }
}

/**
 * 导出适配器工厂函数
 */
export function createAdapters(baseURL: string) {
  return {
    storage: new UniStorage(),
    http: new UniHttp(baseURL),
  };
}
