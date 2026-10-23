# WorkSphere

**Premium Enterprise Work Management SaaS**

WorkSphere is a full-stack, multi-tenant enterprise work management platform built with Next.js 15, NestJS, PostgreSQL, Redis, and Socket.IO. It delivers organization-scoped project/task management, real-time server-authoritative time tracking, live team monitoring, HR workflows, reports, audit logs, and role-based access for five distinct roles.

---

## ✨ Features

- **🔐 Secure Multi-Tenant Auth** — JWT access + refresh token rotation, Argon2 hashing, org isolation
- **👥 5 User Roles** — Super Admin, HR, Department Head, Manager, Employee
- **📋 Project & Task Management** — Kanban boards, list view, drag-and-drop, real-time updates
- **⏱️ Server-Authoritative Timers** — Start/pause/resume/stop with PostgreSQL persistence
- **👁️ Live Team Monitoring** — Real-time presence, active timers, team capacity
- **📊 Timesheets & Reports** — Submit → approve workflow, utilization charts, CSV/PDF export
- **📅 Meetings & Calendar** — Scheduler, iCal invites, in-app calendar
- **🔔 Real-time Notifications** — Socket.IO + email (Resend)
- **📝 Audit Logs** — Comprehensive activity tracking for compliance
- **🌙 Dark/Light Mode** — System-aware with manual toggle

---

## 🏗️ Architecture

```
worksphere/
├── apps/
│   ├── web/          # Next.js 15 App Router (port 3000)
│   └── api/          # NestJS REST API + WebSocket (port 4000)
├── packages/
│   ├── types/        # @repo/types — Shared TypeScript interfaces
│   ├── validation/   # @repo/validation — Shared Zod schemas
│   ├── database/     # @repo/database — Prisma schema + client
│   └── config/       # Shared tsconfig, eslint presets
├── docker-compose.yml # PostgreSQL 15 + Redis 7
└── turbo.json         # Turborepo pipeline
```

---

## 🚀 Quick Start

### Prerequisites
- Node.js 20+
- pnpm 9+
- Docker Desktop

### 1. Clone and install
```bash
git clone <repo-url> worksphere
cd worksphere
pnpm install
```

### 2. Start infrastructure
```bash
docker-compose up -d
```

### 3. Set up environment variables
```bash
# Copy examples
cp .env.example apps/web/.env.local
cp .env.example apps/api/.env
cp .env.example packages/database/.env

# Edit each file with your values (especially the secrets)
```

### 4. Run database migrations
```bash
cd packages/database
pnpm db:migrate
pnpm db:seed    # Creates demo data
```

### 5. Start development
```bash
cd ../..
pnpm dev        # Starts all apps via Turborepo
```

**Web**: http://localhost:3000  
**API**: http://localhost:4000  
**Swagger**: http://localhost:4000/api/docs  
**Prisma Studio**: `pnpm db:studio`

---

## 🔑 Demo Credentials

After running `pnpm db:seed`:

| Role | Email | Password |
|---|---|---|
| Super Admin | admin@acme-corp.com | WorkSphere@123 |
| HR | hr@acme-corp.com | WorkSphere@123 |
| Dept Head | eng.head@acme-corp.com | WorkSphere@123 |
| Manager | manager@acme-corp.com | WorkSphere@123 |
| Employee | alice@acme-corp.com | WorkSphere@123 |
| Employee | bob@acme-corp.com | WorkSphere@123 |
| Employee | carol@acme-corp.com | WorkSphere@123 |

---

## 🧪 Testing

```bash
pnpm test           # Unit tests (Jest)
pnpm test:e2e       # E2E tests (Supertest)
pnpm --filter web test  # Frontend component tests
```

---

## 📚 Documentation

- [SETUP.md](./SETUP.md) — Full setup guide
- [API Docs](http://localhost:4000/api/docs) — Swagger (when running)

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 15, React 19, TypeScript |
| Styling | Tailwind CSS, shadcn/ui |
| Backend | NestJS, TypeScript |
| Database | PostgreSQL 15 + Prisma |
| Cache/Queue | Redis 7 + BullMQ |
| Real-time | Socket.IO + Redis Adapter |
| Auth | JWT + NextAuth.js v5 |
| Email | Resend |
| Monorepo | Turborepo + pnpm |
