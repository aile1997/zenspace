import { Injectable, OnModuleDestroy } from '@nestjs/common';
import Redis from 'ioredis';

/**
 * Redis 服务
 *
 * 封装 Redis 客户端，提供缓存和验证码存储功能
 */
@Injectable()
export class RedisService implements OnModuleDestroy {
  private readonly redis: Redis;

  constructor() {
    // 从环境变量获取 Redis 连接字符串
    const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';

    // 创建 Redis 客户端
    this.redis = new Redis(redisUrl);

    // 连接成功时的日志
    this.redis.on('connect', () => {
      console.log('✅ Redis 连接成功');
    });

    // 连接错误时的日志
    this.redis.on('error', (err) => {
      console.error('❌ Redis 连接错误:', err);
    });
  }

  /**
   * 存储验证码
   *
   * @param phone 手机号码（作为 key）
   * @param code 验证码
   * @param ttl 过期时间（秒），默认 300 秒（5分钟）
   */
  async setVerificationCode(
    phone: string,
    code: string,
    ttl: number = 300,
  ): Promise<void> {
    const key = `sms:code:${phone}`;
    await this.redis.set(key, code, 'EX', ttl);
  }

  /**
   * 获取验证码
   *
   * @param phone 手机号码
   * @returns 验证码，如果不存在或已过期则返回 null
   */
  async getVerificationCode(phone: string): Promise<string | null> {
    const key = `sms:code:${phone}`;
    return await this.redis.get(key);
  }

  /**
   * 删除验证码
   *
   * @param phone 手机号码
   */
  async deleteVerificationCode(phone: string): Promise<void> {
    const key = `sms:code:${phone}`;
    await this.redis.del(key);
  }

  /**
   * 检查验证码是否存在
   *
   * @param phone 手机号码
   * @returns 是否存在
   */
  async hasVerificationCode(phone: string): Promise<boolean> {
    const key = `sms:code:${phone}`;
    const result = await this.redis.exists(key);
    return result === 1;
  }

  /**
   * 存储刷新令牌
   *
   * @param userId 用户 ID
   * @param refreshToken 刷新令牌
   * @param ttl 过期时间（秒），默认 7 天
   */
  async setRefreshToken(
    userId: string,
    refreshToken: string,
    ttl: number = 7 * 24 * 60 * 60,
  ): Promise<void> {
    const key = `auth:refresh:${userId}`;
    await this.redis.set(key, refreshToken, 'EX', ttl);
  }

  /**
   * 获取刷新令牌
   *
   * @param userId 用户 ID
   * @returns 刷新令牌，如果不存在则返回 null
   */
  async getRefreshToken(userId: string): Promise<string | null> {
    const key = `auth:refresh:${userId}`;
    return await this.redis.get(key);
  }

  /**
   * 删除刷新令牌
   *
   * @param userId 用户 ID
   */
  async deleteRefreshToken(userId: string): Promise<void> {
    const key = `auth:refresh:${userId}`;
    await this.redis.del(key);
  }

  /**
   * 模块销毁时关闭 Redis 连接
   */
  async onModuleDestroy() {
    await this.redis.quit();
  }
}
