import { IsString, IsDateString, IsInt, Min, Max } from 'class-validator';

/**
 * 创建预约 DTO
 */
export class CreateBookingDto {
  @IsString()
  seatId: string;

  @IsDateString()
  bookingDate: string; // 格式: YYYY-MM-DD

  @IsString()
  startTime: string; // 格式: HH:mm

  @IsInt()
  @Min(1)
  @Max(8)
  duration: number; // 时长（小时）
}
