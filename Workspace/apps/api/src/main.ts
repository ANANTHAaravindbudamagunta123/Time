import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import * as cookieParser from 'cookie-parser';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';
import { RedisIoAdapter } from './sockets/redis-io.adapter';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  const app = await NestFactory.create(AppModule, {
    logger: ['log', 'error', 'warn', 'debug', 'verbose'],
  });

  const config = app.get(ConfigService);
  const port = config.get<number>('APP_PORT', 4000);
  const frontendUrl = config.get<string>('FRONTEND_URL', 'http://localhost:3000');
  const nodeEnv = config.get<string>('NODE_ENV', 'development');

  // ─── Global API Prefix ────────────────────────────────────────────────────
  app.setGlobalPrefix('api/v1');

  // ─── CORS ─────────────────────────────────────────────────────────────────
  app.enableCors({
    origin: [frontendUrl, 'http://localhost:3000', 'http://localhost:3001'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  });

  // ─── Cookie Parser (for HttpOnly refresh token) ────────────────────────────
  app.use(cookieParser());

  // ─── Global Validation Pipe ───────────────────────────────────────────────
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  // ─── Global Exception Filter ──────────────────────────────────────────────
  app.useGlobalFilters(new HttpExceptionFilter());

  // ─── Global Response Transform Interceptor ────────────────────────────────
  app.useGlobalInterceptors(new TransformInterceptor());

  // ─── Redis Socket.IO Adapter ──────────────────────────────────────────────
  const redisIoAdapter = new RedisIoAdapter(app);
  await redisIoAdapter.connectToRedis();
  app.useWebSocketAdapter(redisIoAdapter);

  // ─── Swagger API Docs (dev only) ─────────────────────────────────────────
  if (nodeEnv !== 'production') {
    const swaggerConfig = new DocumentBuilder()
      .setTitle('WorkSphere API')
      .setDescription('WorkSphere Enterprise Work Management Platform API')
      .setVersion('1.0')
      .addBearerAuth()
      .addCookieAuth('refresh_token')
      .addTag('auth', 'Authentication & Authorization')
      .addTag('users', 'User Management')
      .addTag('organizations', 'Organization Administration')
      .addTag('departments', 'Department Management')
      .addTag('projects', 'Project Management')
      .addTag('tasks', 'Task Management')
      .addTag('timers', 'Time Tracking')
      .addTag('timesheets', 'Timesheet Management')
      .addTag('meetings', 'Meeting & Calendar')
      .addTag('notifications', 'Notifications')
      .addTag('reports', 'Reports & Analytics')
      .addTag('audit', 'Audit Logs')
      .build();

    const document = SwaggerModule.createDocument(app, swaggerConfig);
    SwaggerModule.setup('api/docs', app, document, {
      swaggerOptions: { persistAuthorization: true },
    });
  }

  // ─── Start ────────────────────────────────────────────────────────────────
  await app.listen(port);
  logger.log(`🚀 WorkSphere API running on: http://localhost:${port}/api/v1`);
  if (nodeEnv !== 'production') {
    logger.log(`📖 Swagger docs: http://localhost:${port}/api/docs`);
  }
}

bootstrap().catch((err) => {
  console.error('Failed to start application:', err);
  process.exit(1);
});
