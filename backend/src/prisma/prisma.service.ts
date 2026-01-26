import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

/**
 * Prisma 服务
 *
 * 封装 Prisma Client，提供数据库连接管理
 * 使用 Prisma 7 的适配器模式，确保连接池的正确管理
 */
@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  private pool: Pool;

  constructor() {
    // 从环境变量获取数据库连接字符串
    const connectionString = process.env.DATABASE_URL;

    // 创建 PostgreSQL 连接池
    // 连接池可以提高性能，避免频繁创建/销毁连接
    const pool = new Pool({ connectionString });

    // 创建 Prisma 适配器
    // Prisma 7+ 需要使用适配器来连接数据库
    const adapter = new PrismaPg(pool);

    // 初始化 Prisma Client，传入适配器
    // 注意：必须先调用 super()，然后才能访问 this
    super({ adapter });

    // 将 pool 保存到实例变量
    this.pool = pool;
  }

  /**
   * 模块初始化时连接数据库
   */
  async onModuleInit() {
    await this.$connect();
  }

  /**
   * 模块销毁时断开连接
   * 确保连接池被正确关闭，避免资源泄漏
   */
  async onModuleDestroy() {
    await this.$disconnect();
    await this.pool.end();
  }
}
