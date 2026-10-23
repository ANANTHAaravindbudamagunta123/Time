import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(PrismaService.name);

  constructor() {
    super({
      log: [
        { emit: 'event', level: 'query' },
        { emit: 'stdout', level: 'error' },
        { emit: 'stdout', level: 'warn' },
      ],
    });
  }

  async onModuleInit() {
    await this.$connect();
    this.logger.log('Prisma connected to PostgreSQL');

    // Log slow queries in development
    if (process.env.NODE_ENV === 'development') {
      // @ts-ignore - Prisma event
      this.$on('query', (e: { query: string; duration: number }) => {
        if (e.duration > 500) {
          this.logger.warn(`Slow query (${e.duration}ms): ${e.query.substring(0, 100)}...`);
        }
      });
    }
  }

  async onModuleDestroy() {
    await this.$disconnect();
    this.logger.log('Prisma disconnected');
  }

  /**
   * Safely exclude fields from a Prisma result object.
   * Usage: prismaService.exclude(user, ['passwordHash', 'hashedRt'])
   */
  exclude<T extends object, K extends keyof T>(entity: T, keys: K[]): Omit<T, K> {
    return Object.fromEntries(
      Object.entries(entity).filter(([key]) => !keys.includes(key as K)),
    ) as Omit<T, K>;
  }
}
