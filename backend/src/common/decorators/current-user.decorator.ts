import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { AuthUserInfo } from '../../modules/auth/types/auth.types';

/**
 * 当前用户装饰器
 *
 * 用于从请求中提取当前登录用户的信息
 * 使用方式：@CurrentUser() user: UserDto
 */
export const CurrentUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): AuthUserInfo | null => {
    const request = ctx
      .switchToHttp()
      .getRequest<Request & { user?: AuthUserInfo }>();
    // request.user 是由 JwtStrategy 设置的
    return request.user ?? null;
  },
);
