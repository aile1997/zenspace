import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '@prisma/prisma.service';
import { RedisService } from '@redis/redis.service';
import { LoginDto } from './dto/login.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { TokenPayload, AuthResponse } from './types/auth.types';

/**
 * 认证服务
 *
 * 处理用户登录、注册、Token 生成和验证等核心逻辑
 */
@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private redis: RedisService,
    private jwtService: JwtService,
  ) {}

  /**
   * 发送验证码
   *
   * @param phone 手机号码
   * @returns 是否发送成功
   */
  async sendCode(phone: string): Promise<{ message: string }> {
    // 检查是否在 60 秒内重复发送
    const hasCode = await this.redis.hasVerificationCode(phone);
    if (hasCode) {
      throw new BadRequestException('验证码已发送，请稍后再试');
    }

    // 生成 6 位随机验证码
    const code = Math.floor(100000 + Math.random() * 900000).toString();

    // 在开发环境下，打印验证码到控制台
    console.log(`📱 验证码: ${code} (手机号: ${phone})`);

    // 将验证码存储到 Redis，5 分钟过期
    await this.redis.setVerificationCode(phone, code, 300);

    // TODO: 集成短信服务（阿里云/腾讯云短信）
    // await this.smsService.sendCode(phone, code);

    return { message: '验证码发送成功' };
  }

  /**
   * 手机验证码登录
   *
   * 如果用户不存在则自动注册
   * @param dto 登录请求
   * @returns 认证响应（Token + 用户信息）
   */
  async login(dto: LoginDto): Promise<AuthResponse> {
    const { phone, code } = dto;

    // 从 Redis 获取验证码
    const storedCode = await this.redis.getVerificationCode(phone);
    if (!storedCode) {
      throw new UnauthorizedException('验证码已过期');
    }

    // 验证验证码是否正确
    if (storedCode !== code) {
      throw new UnauthorizedException('验证码错误');
    }

    // 验证成功后删除验证码
    await this.redis.deleteVerificationCode(phone);

    // 查找或创建用户
    let user = await this.prisma.user.findUnique({
      where: { phone },
    });

    // 如果用户不存在，自动注册
    if (!user) {
      user = await this.prisma.user.create({
        data: {
          phone,
          nickname: `用户${phone.slice(-4)}`, // 默认昵称
        },
      });
    }

    // 生成 Token
    // 用户是通过手机号登录的，phone 字段确保存在
    const tokens = this.generateTokens(user.id, user.phone!);

    // 存储刷新令牌到 Redis
    await this.redis.setRefreshToken(user.id, tokens.refreshToken);

    return {
      ...tokens,
      user: {
        id: user.id,
        phone: user.phone!,
        nickname: user.nickname,
        avatar: user.avatar,
        level: user.level,
        points: user.points,
        creditScore: user.creditScore,
      },
    };
  }

  /**
   * 刷新访问令牌
   *
   * @param refreshToken 刷新令牌
   * @returns 新的访问令牌
   */
  async refreshTokens(refreshToken: string): Promise<{ accessToken: string }> {
    try {
      // 验证刷新令牌
      const payload = this.jwtService.verify<TokenPayload>(refreshToken);

      // 从 Redis 获取存储的刷新令牌
      const storedRefreshToken = await this.redis.getRefreshToken(payload.sub);
      if (!storedRefreshToken) {
        throw new UnauthorizedException('刷新令牌已过期');
      }

      // 验证刷新令牌是否匹配
      if (storedRefreshToken !== refreshToken) {
        throw new UnauthorizedException('刷新令牌无效');
      }

      // 生成新的访问令牌
      const accessToken = this.jwtService.sign({
        sub: payload.sub,
        phone: payload.phone,
      });

      return { accessToken };
    } catch {
      throw new UnauthorizedException('刷新令牌无效');
    }
  }

  /**
   * 用户登出
   *
   * @param userId 用户 ID
   */
  async logout(userId: string): Promise<{ message: string }> {
    // 删除刷新令牌
    await this.redis.deleteRefreshToken(userId);

    return { message: '登出成功' };
  }

  /**
   * 获取用户信息
   *
   * @param userId 用户 ID
   * @returns 用户信息
   */
  async getProfile(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
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

    if (!user) {
      throw new UnauthorizedException('用户不存在');
    }

    return user;
  }

  /**
   * 更新用户信息
   *
   * @param userId 用户 ID
   * @param dto 更新数据
   * @returns 更新后的用户信息
   */
  async updateProfile(userId: string, dto: UpdateProfileDto) {
    const user = await this.prisma.user.update({
      where: { id: userId },
      data: dto,
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

    return user;
  }

  /**
   * 生成访问令牌和刷新令牌
   *
   * @param userId 用户 ID
   * @param phone 手机号
   * @returns Token 对
   */
  private generateTokens(userId: string, phone: string) {
    const payload: TokenPayload = { sub: userId, phone };

    // 访问令牌（1 小时过期）
    const accessToken = this.jwtService.sign(payload, {
      expiresIn: '1h',
    });

    // 刷新令牌（7 天过期）
    const refreshToken = this.jwtService.sign(payload, {
      secret: process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET,
      expiresIn: '7d',
    });

    return { accessToken, refreshToken };
  }
}
