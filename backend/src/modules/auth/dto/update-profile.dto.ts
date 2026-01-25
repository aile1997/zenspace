import { IsString, IsOptional, MaxLength } from 'class-validator';

/**
 * 更新用户信息 DTO
 *
 * 用于验证更新用户信息请求的参数
 * 所有字段都是可选的，只更新传入的字段
 */
export class UpdateProfileDto {
  /**
   * 昵称
   *
   * 可选，最长 50 个字符
   */
  @IsString({ message: '昵称必须是字符串' })
  @IsOptional()
  @MaxLength(50, { message: '昵称不能超过 50 个字符' })
  nickname?: string;

  /**
   * 头像 URL
   *
   * 可选，必须是有效的 URL
   */
  @IsString({ message: '头像必须是字符串' })
  @IsOptional()
  avatar?: string;
}
