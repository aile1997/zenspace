import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PrismaService } from '@prisma/prisma.service';

/**
 * JWT 认证策略
 *
 * 用于验证访问令牌，从 Token 中提取用户信息
 */
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private prisma: PrismaService) {
    super({
      // 从 Authorization Header 中提取 Token
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      // 忽略 Token 过期时间（由 JWT 模块处理）
      ignoreExpiration: false,
      // 使用环境变量中的密钥
      secretOrKey:
        process.env.JWT_SECRET ||
        'your-super-secret-jwt-key-change-in-production',
    });
  }

  /**
   * 验证 Token 并返回用户信息
   *
   * Passport 会自动调用此方法，传入解码后的 Token payload
   * @param payload Token payload，包含用户 ID
   * @returns 用户信息
   */
  async validate(payload: { sub: string; phone: string }) {
    // 从数据库中查询用户
    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub },
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

    // 如果用户不存在，抛出未授权异常
    if (!user) {
      throw new UnauthorizedException('用户不存在');
    }

    // 返回用户信息，会被附加到 request.user 上
    return user;
  }
}
