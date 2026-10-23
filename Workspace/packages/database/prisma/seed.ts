/**
 * WorkSphere — Database Seed Script
 * Creates a demo organization with users, departments, projects, and tasks.
 *
 * Run with: pnpm db:seed (from packages/database)
 * or:       npx ts-node --transpile-only prisma/seed.ts
 */

import { PrismaClient, UserRole, ProjectStatus, TaskStatus, TaskPriority, OrgPlan } from '@prisma/client';
import * as argon2 from 'argon2';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding WorkSphere database...');

  // ─── Create demo organization ───────────────────────────────────────────────
  const org = await prisma.organization.upsert({
    where: { slug: 'acme-corp' },
    update: {},
    create: {
      name: 'Acme Corporation',
      slug: 'acme-corp',
      plan: OrgPlan.PRO,
      timezone: 'America/New_York',
      workingHoursStart: '09:00',
      workingHoursEnd: '18:00',
      maxSeats: 50,
    },
  });
  console.log(`✅ Organization: ${org.name} (${org.id})`);

  // ─── Password hash (same for all demo users: "WorkSphere@123") ─────────────
  const demoPassword = await argon2.hash('WorkSphere@123');

  // ─── Create Super Admin ─────────────────────────────────────────────────────
  const superAdmin = await prisma.user.upsert({
    where: { email: 'admin@acme-corp.com' },
    update: {},
    create: {
      email: 'admin@acme-corp.com',
      name: 'Alex Morrison',
      passwordHash: demoPassword,
      role: UserRole.SUPER_ADMIN,
      orgId: org.id,
      jobTitle: 'System Administrator',
      isOnboarded: true,
      isActive: true,
    },
  });
  console.log(`✅ Super Admin: ${superAdmin.email}`);

  // ─── Create HR Manager ──────────────────────────────────────────────────────
  const hrManager = await prisma.user.upsert({
    where: { email: 'hr@acme-corp.com' },
    update: {},
    create: {
      email: 'hr@acme-corp.com',
      name: 'Sarah Chen',
      passwordHash: demoPassword,
      role: UserRole.HR,
      orgId: org.id,
      jobTitle: 'HR Director',
      isOnboarded: true,
      isActive: true,
    },
  });
  console.log(`✅ HR: ${hrManager.email}`);

  // ─── Create Engineering Department Head ─────────────────────────────────────
  const engHead = await prisma.user.upsert({
    where: { email: 'eng.head@acme-corp.com' },
    update: {},
    create: {
      email: 'eng.head@acme-corp.com',
      name: 'Marcus Johnson',
      passwordHash: demoPassword,
      role: UserRole.DEPT_HEAD,
      orgId: org.id,
      jobTitle: 'VP of Engineering',
      isOnboarded: true,
      isActive: true,
    },
  });

  // ─── Create Engineering Manager ─────────────────────────────────────────────
  const engManager = await prisma.user.upsert({
    where: { email: 'manager@acme-corp.com' },
    update: {},
    create: {
      email: 'manager@acme-corp.com',
      name: 'Priya Patel',
      passwordHash: demoPassword,
      role: UserRole.MANAGER,
      orgId: org.id,
      jobTitle: 'Engineering Manager',
      isOnboarded: true,
      isActive: true,
    },
  });

  // ─── Create Employees ───────────────────────────────────────────────────────
  const employee1 = await prisma.user.upsert({
    where: { email: 'alice@acme-corp.com' },
    update: {},
    create: {
      email: 'alice@acme-corp.com',
      name: 'Alice Walker',
      passwordHash: demoPassword,
      role: UserRole.EMPLOYEE,
      orgId: org.id,
      jobTitle: 'Senior Software Engineer',
      isOnboarded: true,
      isActive: true,
    },
  });

  const employee2 = await prisma.user.upsert({
    where: { email: 'bob@acme-corp.com' },
    update: {},
    create: {
      email: 'bob@acme-corp.com',
      name: 'Bob Singh',
      passwordHash: demoPassword,
      role: UserRole.EMPLOYEE,
      orgId: org.id,
      jobTitle: 'Frontend Developer',
      isOnboarded: true,
      isActive: true,
    },
  });

  const employee3 = await prisma.user.upsert({
    where: { email: 'carol@acme-corp.com' },
    update: {},
    create: {
      email: 'carol@acme-corp.com',
      name: 'Carol Martinez',
      passwordHash: demoPassword,
      role: UserRole.EMPLOYEE,
      orgId: org.id,
      jobTitle: 'Backend Developer',
      isOnboarded: true,
      isActive: true,
    },
  });
  console.log('✅ Created demo users');

  // ─── Create Departments ─────────────────────────────────────────────────────
  const engDept = await prisma.department.upsert({
    where: { name_orgId: { name: 'Engineering', orgId: org.id } },
    update: {},
    create: {
      name: 'Engineering',
      description: 'Software engineering and platform team',
      orgId: org.id,
      headId: engHead.id,
    },
  });

  const hrDept = await prisma.department.upsert({
    where: { name_orgId: { name: 'Human Resources', orgId: org.id } },
    update: {},
    create: {
      name: 'Human Resources',
      description: 'People operations and HR team',
      orgId: org.id,
      headId: hrManager.id,
    },
  });
  console.log('✅ Created departments');

  // ─── Assign users to departments ────────────────────────────────────────────
  await prisma.user.updateMany({
    where: {
      id: { in: [engHead.id, engManager.id, employee1.id, employee2.id, employee3.id] },
    },
    data: { departmentId: engDept.id },
  });
  await prisma.user.update({
    where: { id: hrManager.id },
    data: { departmentId: hrDept.id },
  });

  // ─── Create Projects ─────────────────────────────────────────────────────────
  const project1 = await prisma.project.create({
    data: {
      name: 'WorkSphere Platform',
      description: 'Core enterprise work management platform development',
      orgId: org.id,
      ownerId: engManager.id,
      status: ProjectStatus.ACTIVE,
      color: '#6366F1',
      dueDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // 90 days
    },
  });

  const project2 = await prisma.project.create({
    data: {
      name: 'Mobile App',
      description: 'iOS and Android mobile application',
      orgId: org.id,
      ownerId: engManager.id,
      status: ProjectStatus.PLANNING,
      color: '#10B981',
      dueDate: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000), // 180 days
    },
  });
  console.log('✅ Created projects');

  // ─── Add project members ─────────────────────────────────────────────────────
  await prisma.projectMember.createMany({
    data: [
      { projectId: project1.id, userId: engManager.id, role: 'OWNER' },
      { projectId: project1.id, userId: employee1.id, role: 'MEMBER' },
      { projectId: project1.id, userId: employee2.id, role: 'MEMBER' },
      { projectId: project1.id, userId: employee3.id, role: 'MEMBER' },
      { projectId: project2.id, userId: engManager.id, role: 'OWNER' },
      { projectId: project2.id, userId: employee1.id, role: 'MEMBER' },
      { projectId: project2.id, userId: employee2.id, role: 'MEMBER' },
    ],
    skipDuplicates: true,
  });

  // ─── Create Tasks ─────────────────────────────────────────────────────────────
  const tasks = await prisma.task.createMany({
    data: [
      {
        title: 'Set up authentication system',
        description: 'Implement JWT-based auth with refresh tokens',
        projectId: project1.id,
        assigneeId: employee3.id,
        reporterId: engManager.id,
        status: TaskStatus.DONE,
        priority: TaskPriority.URGENT,
        completedAt: new Date(),
        order: 1,
      },
      {
        title: 'Build project management module',
        description: 'CRUD operations for projects and task boards',
        projectId: project1.id,
        assigneeId: employee1.id,
        reporterId: engManager.id,
        status: TaskStatus.IN_PROGRESS,
        priority: TaskPriority.HIGH,
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        estimatedHours: 24,
        order: 2,
      },
      {
        title: 'Implement real-time timer system',
        description: 'Server-authoritative timer with Socket.IO broadcast',
        projectId: project1.id,
        assigneeId: employee3.id,
        reporterId: engManager.id,
        status: TaskStatus.IN_PROGRESS,
        priority: TaskPriority.HIGH,
        dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
        estimatedHours: 16,
        order: 3,
      },
      {
        title: 'Design dashboard UI',
        description: 'Role-based dashboards with analytics widgets',
        projectId: project1.id,
        assigneeId: employee2.id,
        reporterId: engManager.id,
        status: TaskStatus.TODO,
        priority: TaskPriority.MEDIUM,
        dueDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
        estimatedHours: 20,
        order: 4,
      },
      {
        title: 'Write API documentation',
        description: 'Swagger/OpenAPI docs for all endpoints',
        projectId: project1.id,
        assigneeId: employee1.id,
        reporterId: engManager.id,
        status: TaskStatus.BACKLOG,
        priority: TaskPriority.LOW,
        order: 5,
      },
      {
        title: 'Mobile app architecture design',
        description: 'Define tech stack and component architecture',
        projectId: project2.id,
        assigneeId: employee2.id,
        reporterId: engManager.id,
        status: TaskStatus.TODO,
        priority: TaskPriority.HIGH,
        dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
        order: 1,
      },
    ],
  });
  console.log(`✅ Created ${tasks.count} tasks`);

  console.log('\n🎉 Seed complete! Demo credentials:');
  console.log('─────────────────────────────────────────────');
  console.log('Super Admin: admin@acme-corp.com');
  console.log('HR:          hr@acme-corp.com');
  console.log('Dept Head:   eng.head@acme-corp.com');
  console.log('Manager:     manager@acme-corp.com');
  console.log('Employee 1:  alice@acme-corp.com');
  console.log('Employee 2:  bob@acme-corp.com');
  console.log('Employee 3:  carol@acme-corp.com');
  console.log('Password (all): WorkSphere@123');
  console.log('─────────────────────────────────────────────');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
