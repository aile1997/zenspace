import { IsString, IsNotEmpty } from 'class-validator';

/**
 * 刷新 Token DTO
 *
 * 用于验证刷新 Token 请求的参数
 */
export class RefreshTokenDto {
  /**
   * 刷新 Token
   *
   * 用于获取新的访问令牌
   */
  @IsString({ message: '刷新 Token 必须是字符串' })
  @IsNotEmpty({ message: '刷新 Token 不能为空' })
  refreshToken: string;
}
