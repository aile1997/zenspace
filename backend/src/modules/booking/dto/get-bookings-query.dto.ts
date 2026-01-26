import { IsOptional, IsIn, IsInt, Min } from 'class-validator';
import { Type } from 'class-transformer';

/**
 * 查询预约列表查询参数 DTO
 *
 * 用于验证查询预约列表的查询参数
 */
export class GetBookingsQueryDto {
  /**
   * 预约状态筛选
   */
  @IsOptional()
  @IsIn(['CONFIRMED', 'CANCELLED', 'COMPLETED'], {
    message: '状态必须是 CONFIRMED、CANCELLED 或 COMPLETED',
  })
  status?: string;

  /**
   * 页码
   */
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: '页码必须是整数' })
  @Min(1, { message: '页码最小为 1' })
  page?: number = 1;

  /**
   * 每页数量
   */
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: '每页数量必须是整数' })
  @Min(1, { message: '每页数量至少为 1' })
  limit?: number = 20;
}
