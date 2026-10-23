# WorkSphere — Complete Setup Guide

## Prerequisites

| Tool | Version | Install |
|---|---|---|
| Node.js | 20+ | https://nodejs.org |
| pnpm | 9+ | `npm install -g pnpm` |
| Docker Desktop | Latest | https://docker.com |
| Git | Latest | https://git-scm.com |

---

## 1. Repository Setup

```bash
git clone <repo-url> worksphere
cd worksphere
pnpm install
```

---

## 2. Infrastructure (Docker)

```bash
# Start PostgreSQL + Redis
docker-compose up -d

# Verify services are running
docker-compose ps

# Stop services
docker-compose down

# Stop + remove volumes (CAUTION: deletes all data)
docker-compose down -v
```

**Services:**
- PostgreSQL: `localhost:5432` (user: `worksphere`, password: `worksphere_password`, db: `worksphere_db`)
- Redis: `localhost:6379`
- pgAdmin (optional): `localhost:5050` (start with `--profile tools`)
- RedisInsight (optional): `localhost:8001` (start with `--profile tools`)

```bash
# With optional GUI tools
docker-compose --profile tools up -d
```

---

## 3. Environment Variables

### apps/web/.env.local
```env
NEXT_PUBLIC_APP_NAME=WorkSphere
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_API_URL=http://localhost:4000/api/v1
NEXT_PUBLIC_WS_URL=http://localhost:4000
AUTH_SECRET=<generate with: npx auth secret>
AUTH_URL=http://localhost:3000
```

### apps/api/.env
```env
DATABASE_URL=postgresql://worksphere:worksphere_password@localhost:5432/worksphere_db?schema=public
REDIS_URL=redis://localhost:6379
REDIS_HOST=localhost
REDIS_PORT=6379

# Generate with: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
JWT_ACCESS_SECRET=<32-byte-hex>
JWT_REFRESH_SECRET=<different-32-byte-hex>
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

APP_PORT=4000
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
API_PREFIX=api/v1

# Get from https://resend.com (free tier available)
RESEND_API_KEY=re_...
RESEND_FROM_EMAIL=noreply@yourdomain.com
RESEND_FROM_NAME=WorkSphere

# Set to true to see email previews in console (no API key needed)
EMAIL_PREVIEW_MODE=true
```

### packages/database/.env
```env
DATABASE_URL=postgresql://worksphere:worksphere_password@localhost:5432/worksphere_db?schema=public
```

---

## 4. Database Setup

```bash
cd packages/database

# Run migrations (creates all tables)
pnpm db:migrate

# Generate Prisma client
pnpm db:generate

# Seed demo data (optional but recommended for development)
pnpm db:seed

# Open Prisma Studio (GUI)
pnpm db:studio
```

---

## 5. Running Development

```bash
# From workspace root — starts all apps in parallel
pnpm dev

# Or run individually:
pnpm --filter api dev      # NestJS API (port 4000)
pnpm --filter web dev      # Next.js (port 3000)
```

---

## 6. Generating Secrets

```bash
# NextAuth secret
npx auth secret

# JWT secrets (run twice for two different secrets)
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

---

## 7. Email Configuration

WorkSphere uses **Resend** for transactional emails.

### Development Mode (no account needed)
Set `EMAIL_PREVIEW_MODE=true` in `apps/api/.env`. All emails will be logged to the API console with a clear `[EMAIL PREVIEW]` label instead of being sent.

### Production Setup
1. Create a free account at https://resend.com
2. Verify your domain
3. Create an API key
4. Set `RESEND_API_KEY=re_...` in `apps/api/.env`
5. Set `RESEND_FROM_EMAIL=noreply@yourdomain.com`
6. Set `EMAIL_PREVIEW_MODE=false`

---

## 8. Testing

```bash
# All tests
pnpm test

# NestJS unit tests only
pnpm --filter api test

# NestJS e2e tests (requires running database)
pnpm --filter api test:e2e

# Next.js component tests
pnpm --filter web test

# With coverage
pnpm --filter api test -- --coverage
```

---

## 9. Building for Production

```bash
# Build all apps
pnpm build

# Or individually
pnpm --filter api build
pnpm --filter web build
```

---

## 10. Production Docker Compose

```bash
# Build and start production containers
docker-compose -f docker-compose.prod.yml up -d --build
```

---

## 11. Prisma Commands Reference

```bash
# Generate client (after schema changes)
npx prisma generate

# Create new migration
npx prisma migrate dev --name <migration-name>

# Apply migrations in production
npx prisma migrate deploy

# Reset database (CAUTION: deletes all data)
npx prisma migrate reset

# Open Prisma Studio
npx prisma studio

# Format schema
npx prisma format
```

---

## 12. Troubleshooting

### Port already in use
```bash
# Find process using port 4000
netstat -ano | findstr :4000
# Kill process
taskkill /PID <PID> /F
```

### Database connection refused
```bash
# Check if PostgreSQL container is running
docker-compose ps
# View logs
docker-compose logs postgres
```

### pnpm workspace resolution errors
```bash
# Clean and reinstall
pnpm store prune
pnpm install --force
```

### Prisma client out of sync
```bash
cd packages/database
npx prisma generate
```
