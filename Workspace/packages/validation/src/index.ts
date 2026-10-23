import z from 'zod';
import { UserRole, TaskStatus, TaskPriority, ProjectStatus, TimesheetStatus } from '@repo/types';

// ─── Auth Schemas ─────────────────────────────────────────────────────────────

export const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
});

export const registerSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number')
    .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character'),
  name: z.string().min(2, 'Name must be at least 2 characters').max(100),
  organizationName: z.string().min(2, 'Organization name must be at least 2 characters').max(100),
  organizationSlug: z
    .string()
    .min(2)
    .max(50)
    .regex(/^[a-z0-9-]+$/, 'Slug must contain only lowercase letters, numbers, and hyphens'),
});

export const acceptInviteSchema = z.object({
  token: z.string().min(1),
  name: z.string().min(2, 'Name must be at least 2 characters').max(100),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
});

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, 'Current password is required'),
    newPassword: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
      .regex(/[0-9]/, 'Password must contain at least one number'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  });

// ─── User/Profile Schemas ─────────────────────────────────────────────────────

export const updateProfileSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  jobTitle: z.string().max(100).optional().nullable(),
  phone: z.string().max(20).optional().nullable(),
  bio: z.string().max(500).optional().nullable(),
  timezone: z.string().optional().nullable(),
  avatarUrl: z.string().url().optional().nullable(),
});

export const inviteUserSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  role: z.nativeEnum(UserRole).default(UserRole.EMPLOYEE),
  departmentId: z.string().uuid().optional().nullable(),
});

export const updateUserRoleSchema = z.object({
  role: z.nativeEnum(UserRole),
});

// ─── Organization Schemas ─────────────────────────────────────────────────────

export const updateOrganizationSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  website: z.string().url().optional().nullable(),
  timezone: z.string().optional(),
  workingHoursStart: z.string().regex(/^\d{2}:\d{2}$/).optional(),
  workingHoursEnd: z.string().regex(/^\d{2}:\d{2}$/).optional(),
  logoUrl: z.string().url().optional().nullable(),
});

// ─── Department Schemas ───────────────────────────────────────────────────────

export const createDepartmentSchema = z.object({
  name: z.string().min(2).max(100),
  description: z.string().max(500).optional().nullable(),
  headId: z.string().uuid().optional().nullable(),
  parentId: z.string().uuid().optional().nullable(),
});

export const updateDepartmentSchema = createDepartmentSchema.partial();

// ─── Project Schemas ──────────────────────────────────────────────────────────

export const createProjectSchema = z.object({
  name: z.string().min(1, 'Project name is required').max(200),
  description: z.string().max(2000).optional().nullable(),
  status: z.nativeEnum(ProjectStatus).default(ProjectStatus.ACTIVE),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/).default('#6366F1'),
  icon: z.string().max(10).optional().nullable(),
  startDate: z.coerce.date().optional().nullable(),
  dueDate: z.coerce.date().optional().nullable(),
  isPrivate: z.boolean().default(false),
  memberIds: z.array(z.string().uuid()).optional().default([]),
});

export const updateProjectSchema = createProjectSchema.partial().omit({ memberIds: true });

export const addProjectMemberSchema = z.object({
  userId: z.string().uuid(),
  role: z.enum(['OWNER', 'ADMIN', 'MEMBER', 'VIEWER']).default('MEMBER'),
});

// ─── Task Schemas ─────────────────────────────────────────────────────────────

export const createTaskSchema = z.object({
  title: z.string().min(1, 'Task title is required').max(500),
  description: z.string().max(10000).optional().nullable(),
  projectId: z.string().uuid(),
  assigneeId: z.string().uuid().optional().nullable(),
  parentId: z.string().uuid().optional().nullable(),
  status: z.nativeEnum(TaskStatus).default(TaskStatus.TODO),
  priority: z.nativeEnum(TaskPriority).default(TaskPriority.NO_PRIORITY),
  dueDate: z.coerce.date().optional().nullable(),
  startDate: z.coerce.date().optional().nullable(),
  estimatedHours: z.number().min(0).max(1000).optional().nullable(),
  labels: z.array(z.string().max(50)).max(10).optional().default([]),
});

export const updateTaskSchema = createTaskSchema.partial().omit({ projectId: true });

export const updateTaskStatusSchema = z.object({
  status: z.nativeEnum(TaskStatus),
  order: z.number().optional(),
});

export const createCommentSchema = z.object({
  content: z.string().min(1, 'Comment cannot be empty').max(5000),
});

export const updateCommentSchema = z.object({
  content: z.string().min(1).max(5000),
});

// ─── Time Tracking Schemas ────────────────────────────────────────────────────

export const startTimerSchema = z.object({
  taskId: z.string().uuid().optional().nullable(),
  notes: z.string().max(500).optional().nullable(),
});

export const stopTimerSchema = z.object({
  notes: z.string().max(500).optional().nullable(),
});

export const createTimeEntrySchema = z.object({
  taskId: z.string().uuid().optional().nullable(),
  projectId: z.string().uuid().optional().nullable(),
  startTime: z.coerce.date(),
  endTime: z.coerce.date(),
  notes: z.string().max(500).optional().nullable(),
  isBillable: z.boolean().default(true),
}).refine(
  (data) => data.endTime > data.startTime,
  { message: 'End time must be after start time', path: ['endTime'] }
);

export const updateTimeEntrySchema = createTimeEntrySchema.partial();

// ─── Timesheet Schemas ────────────────────────────────────────────────────────

export const submitTimesheetSchema = z.object({
  weekStart: z.coerce.date(),
});

export const reviewTimesheetSchema = z.object({
  status: z.enum([TimesheetStatus.APPROVED, TimesheetStatus.REJECTED]),
  rejectionReason: z.string().max(500).optional().nullable(),
});

// ─── Meeting Schemas ──────────────────────────────────────────────────────────

export const createMeetingSchema = z.object({
  title: z.string().min(1, 'Meeting title is required').max(200),
  description: z.string().max(2000).optional().nullable(),
  startTime: z.coerce.date(),
  endTime: z.coerce.date(),
  location: z.string().max(200).optional().nullable(),
  meetingUrl: z.string().url().optional().nullable(),
  attendeeIds: z.array(z.string().uuid()).min(0).default([]),
  isRecurring: z.boolean().default(false),
  recurringRule: z.string().max(200).optional().nullable(),
}).refine(
  (data) => data.endTime > data.startTime,
  { message: 'End time must be after start time', path: ['endTime'] }
);

export const updateMeetingSchema = createMeetingSchema.partial().omit({ attendeeIds: true });

// ─── Pagination Schema ────────────────────────────────────────────────────────

export const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
  search: z.string().optional(),
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

// ─── Type Exports ─────────────────────────────────────────────────────────────

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type AcceptInviteInput = z.infer<typeof acceptInviteSchema>;
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
export type InviteUserInput = z.infer<typeof inviteUserSchema>;
export type CreateProjectInput = z.infer<typeof createProjectSchema>;
export type UpdateProjectInput = z.infer<typeof updateProjectSchema>;
export type CreateTaskInput = z.infer<typeof createTaskSchema>;
export type UpdateTaskInput = z.infer<typeof updateTaskSchema>;
export type StartTimerInput = z.infer<typeof startTimerSchema>;
export type CreateTimeEntryInput = z.infer<typeof createTimeEntrySchema>;
export type CreateMeetingInput = z.infer<typeof createMeetingSchema>;
export type PaginationInput = z.infer<typeof paginationSchema>;
