import { IsString, IsNotEmpty, Matches, Length } from 'class-validator';

/**
 * 登录 DTO
 *
 * 用于验证登录请求的参数
 */
export class LoginDto {
  /**
   * 手机号码
   *
   * 必须是中国大陆手机号格式（11位数字，1开头）
   */
  @IsString({ message: '手机号必须是字符串' })
  @IsNotEmpty({ message: '手机号不能为空' })
  @Matches(/^1[3-9]\d{9}$/, { message: '手机号格式不正确' })
  phone: string;

  /**
   * 验证码
   *
   * 6位数字验证码
   */
  @IsString({ message: '验证码必须是字符串' })
  @IsNotEmpty({ message: '验证码不能为空' })
  @Length(6, 6, { message: '验证码必须是6位数字' })
  @Matches(/^\d{6}$/, { message: '验证码格式不正确' })
  code: string;
}
