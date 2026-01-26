import { Injectable, ExecutionContext } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Observable } from 'rxjs';

/**
 * 可选 JWT 认证守卫
 *
 * 允许未登录用户访问路由，但如果提供了有效的 Token 也会解析用户信息
 * 使用场景：获取用户信息（未登录返回 null，已登录返回用户信息）
 */
@Injectable()
export class OptionalJwtAuthGuard extends AuthGuard('jwt') {
  /**
   * 判断请求是否可以被路由处理
   *
   * 即使 Token 无效也不会抛出异常，允许请求继续
   */
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    return super.canActivate(context);
  }

  /**
   * 处理认证失败的情况
   *
   * 重写此方法以避免认证失败时抛出异常
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  handleRequest(_err: any, user: any, _info: any, _context?: any): any {
    // 即使认证失败，也继续处理请求
    // user 会是 undefined 或 null
    return user;
  }
}
