// WorkSphere — Database Package Exports
// Re-exports PrismaClient and related types for use in apps/api

export { PrismaClient } from '@prisma/client';
export * from '@prisma/client';

import { PrismaClient } from '@prisma/client';

// Singleton pattern for local dev (prevents connection exhaustion with hot reload)
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}
