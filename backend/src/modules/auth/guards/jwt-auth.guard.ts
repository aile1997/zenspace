import { Injectable, ExecutionContext } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Observable } from 'rxjs';

/**
 * JWT 认证守卫
 *
 * 用于保护需要登录才能访问的路由
 * 使用方式：在 Controller 或方法上添加 @UseGuards(JwtAuthGuard)
 */
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  /**
   * 判断请求是否可以被路由处理
   *
   * 如果 Token 无效，会返回 401 Unauthorized
   */
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    return super.canActivate(context);
  }
}
