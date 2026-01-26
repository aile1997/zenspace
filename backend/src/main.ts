import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // 配置全局路由前缀（包含版本号）
  app.setGlobalPrefix('api/v1');

  // 配置 CORS，允许前端跨域访问
  app.enableCors({
    origin: ['http://localhost:5173', 'http://localhost:8080'], // 前端开发服务器地址
    credentials: true,
  });

  await app.listen(process.env.PORT ?? 3000);

  console.log(
    `🚀 应用运行在: http://localhost:${process.env.PORT ?? 3000}/api/v1`,
  );
}

void bootstrap();
