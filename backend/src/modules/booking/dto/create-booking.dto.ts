import { IsString, IsISO8601, IsInt, Min, Max } from 'class-validator';

/**
 * 创建预约 DTO
 *
 * 用于验证创建预约请求的参数
 */
export class CreateBookingDto {
  /**
   * 座位 ID
   */
  @IsString({ message: '座位 ID 必须是字符串' })
  seatId: string;

  /**
   * 预约开始时间（ISO 8601 格式）
   */
  @IsISO8601({}, { message: '开始时间格式不正确' })
  startTime: string;

  /**
   * 预约时长（小时）
   */
  @IsInt({ message: '预约时长必须是整数' })
  @Min(1, { message: '预约时长至少 1 小时' })
  @Max(8, { message: '预约时长最多 8 小时' })
  duration: number;
}
