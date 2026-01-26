import { Module, Global } from '@nestjs/common';
import { PrismaService } from './prisma.service';

/**
 * Prisma 模块
 *
 * 使用 @Global() 装饰器使此模块在整个应用中可用
 * 其他模块可以直接注入 PrismaService 而无需导入 PrismaModule
 */
@Global()
@Module({
  providers: [PrismaService],
  exports: [PrismaService],
})
export class PrismaModule {}
