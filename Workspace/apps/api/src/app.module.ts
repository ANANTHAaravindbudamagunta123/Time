import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { BullModule } from '@nestjs/bullmq';
import Joi from 'joi';
import { PrismaModule } from './common/prisma/prisma.module';
import { RedisModule } from './common/redis/redis.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { OrganizationsModule } from './organizations/organizations.module';
import { DepartmentsModule } from './departments/departments.module';
import { ProjectsModule } from './projects/projects.module';
import { TasksModule } from './tasks/tasks.module';
import { TimersModule } from './timers/timers.module';
import { TimesheetsModule } from './timesheets/timesheets.module';
import { MeetingsModule } from './meetings/meetings.module';
import { NotificationsModule } from './notifications/notifications.module';
import { ReportsModule } from './reports/reports.module';
import { AuditModule } from './audit/audit.module';
import { EmailModule } from './email/email.module';
import { SocketsModule } from './sockets/sockets.module';

@Module({
  imports: [
    // ─── Config ─────────────────────────────────────────────────────────────
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
      validationSchema: Joi.object({
        DATABASE_URL: Joi.string().required(),
        REDIS_URL: Joi.string().default('redis://localhost:6379'),
        REDIS_HOST: Joi.string().default('localhost'),
        REDIS_PORT: Joi.number().default(6379),
        JWT_ACCESS_SECRET: Joi.string().required(),
        JWT_REFRESH_SECRET: Joi.string().required(),
        JWT_ACCESS_EXPIRES_IN: Joi.string().default('15m'),
        JWT_REFRESH_EXPIRES_IN: Joi.string().default('7d'),
        APP_PORT: Joi.number().default(4000),
        NODE_ENV: Joi.string().valid('development', 'production', 'test').default('development'),
        FRONTEND_URL: Joi.string().default('http://localhost:3000'),
        RESEND_API_KEY: Joi.string().optional().allow(''),
        RESEND_FROM_EMAIL: Joi.string().email().optional(),
        RESEND_FROM_NAME: Joi.string().default('WorkSphere'),
        EMAIL_PREVIEW_MODE: Joi.boolean().default(true),
      }),
    }),

    // ─── BullMQ Queues ───────────────────────────────────────────────────────
    BullModule.forRoot({
      connection: {
        host: process.env.REDIS_HOST || 'localhost',
        port: parseInt(process.env.REDIS_PORT || '6379', 10),
      },
    }),

    // ─── Core Modules ────────────────────────────────────────────────────────
    PrismaModule,
    RedisModule,
    EmailModule,
    AuditModule,
    SocketsModule,

    // ─── Feature Modules ─────────────────────────────────────────────────────
    AuthModule,
    UsersModule,
    OrganizationsModule,
    DepartmentsModule,
    ProjectsModule,
    TasksModule,
    TimersModule,
    TimesheetsModule,
    MeetingsModule,
    NotificationsModule,
    ReportsModule,
  ],
})
export class AppModule {}
