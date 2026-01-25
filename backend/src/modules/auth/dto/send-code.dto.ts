import { IsString, IsNotEmpty, Matches } from 'class-validator';

/**
 * 发送验证码 DTO
 *
 * 用于验证发送验证码请求的参数
 */
export class SendCodeDto {
  /**
   * 手机号码
   *
   * 必须是中国大陆手机号格式（11位数字，1开头）
   */
  @IsString({ message: '手机号必须是字符串' })
  @IsNotEmpty({ message: '手机号不能为空' })
  @Matches(/^1[3-9]\d{9}$/, { message: '手机号格式不正确' })
  phone: string;
}
