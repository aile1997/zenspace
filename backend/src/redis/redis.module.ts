import { Module, Global } from '@nestjs/common';
import { RedisService } from './redis.service';

/**
 * Redis 模块
 *
 * 使用 @Global() 装饰器使此模块在整个应用中可用
 * 其他模块可以直接注入 RedisService 而无需导入 RedisModule
 */
@Global()
@Module({
  providers: [RedisService],
  exports: [RedisService],
})
export class RedisModule {}
