// ─────────────────────────────────────────────────────────────────────────────
// WorkSphere — Shared TypeScript Types
// Used by both apps/web (Next.js) and apps/api (NestJS)
// ─────────────────────────────────────────────────────────────────────────────

// ─── Enums ───────────────────────────────────────────────────────────────────

export enum UserRole {
  SUPER_ADMIN = 'SUPER_ADMIN',
  HR = 'HR',
  DEPT_HEAD = 'DEPT_HEAD',
  MANAGER = 'MANAGER',
  EMPLOYEE = 'EMPLOYEE',
}

export enum OrgPlan {
  FREE = 'FREE',
  PRO = 'PRO',
  ENTERPRISE = 'ENTERPRISE',
}

export enum ProjectStatus {
  PLANNING = 'PLANNING',
  ACTIVE = 'ACTIVE',
  ON_HOLD = 'ON_HOLD',
  COMPLETED = 'COMPLETED',
  ARCHIVED = 'ARCHIVED',
}

export enum TaskStatus {
  BACKLOG = 'BACKLOG',
  TODO = 'TODO',
  IN_PROGRESS = 'IN_PROGRESS',
  IN_REVIEW = 'IN_REVIEW',
  DONE = 'DONE',
  CANCELLED = 'CANCELLED',
}

export enum TaskPriority {
  URGENT = 'URGENT',
  HIGH = 'HIGH',
  MEDIUM = 'MEDIUM',
  LOW = 'LOW',
  NO_PRIORITY = 'NO_PRIORITY',
}

export enum TimerState {
  IDLE = 'IDLE',
  RUNNING = 'RUNNING',
  PAUSED = 'PAUSED',
  STOPPED = 'STOPPED',
}

export enum TimesheetStatus {
  DRAFT = 'DRAFT',
  SUBMITTED = 'SUBMITTED',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
}

export enum NotificationType {
  TASK_ASSIGNED = 'TASK_ASSIGNED',
  TASK_UPDATED = 'TASK_UPDATED',
  DEADLINE_CHANGED = 'DEADLINE_CHANGED',
  DEADLINE_APPROACHING = 'DEADLINE_APPROACHING',
  TIMESHEET_SUBMITTED = 'TIMESHEET_SUBMITTED',
  TIMESHEET_APPROVED = 'TIMESHEET_APPROVED',
  TIMESHEET_REJECTED = 'TIMESHEET_REJECTED',
  INVITATION_SENT = 'INVITATION_SENT',
  MEETING_INVITED = 'MEETING_INVITED',
  MEETING_REMINDER = 'MEETING_REMINDER',
  MENTION = 'MENTION',
  COMMENT_ADDED = 'COMMENT_ADDED',
}

export enum AttendeeStatus {
  PENDING = 'PENDING',
  ACCEPTED = 'ACCEPTED',
  DECLINED = 'DECLINED',
  TENTATIVE = 'TENTATIVE',
}

export enum AuditAction {
  CREATE = 'CREATE',
  UPDATE = 'UPDATE',
  DELETE = 'DELETE',
  LOGIN = 'LOGIN',
  LOGOUT = 'LOGOUT',
  INVITE_SENT = 'INVITE_SENT',
  INVITE_ACCEPTED = 'INVITE_ACCEPTED',
  ROLE_CHANGED = 'ROLE_CHANGED',
  TIMER_STARTED = 'TIMER_STARTED',
  TIMER_PAUSED = 'TIMER_PAUSED',
  TIMER_STOPPED = 'TIMER_STOPPED',
  TIMESHEET_SUBMITTED = 'TIMESHEET_SUBMITTED',
  TIMESHEET_APPROVED = 'TIMESHEET_APPROVED',
  TIMESHEET_REJECTED = 'TIMESHEET_REJECTED',
}

export enum CalendarProvider {
  GOOGLE = 'GOOGLE',
  MICROSOFT = 'MICROSOFT',
}

// ─── Base Entity ─────────────────────────────────────────────────────────────

export interface BaseEntity {
  id: string;
  createdAt: Date;
  updatedAt: Date;
}

// ─── Organization ─────────────────────────────────────────────────────────────

export interface Organization extends BaseEntity {
  name: string;
  slug: string;
  plan: OrgPlan;
  logoUrl: string | null;
  website: string | null;
  timezone: string;
  workingHoursStart: string; // "09:00"
  workingHoursEnd: string;   // "18:00"
  maxSeats: number;
  settings: OrganizationSettings;
}

export interface OrganizationSettings {
  requireTimesheetApproval: boolean;
  allowSelfTimerStop: boolean;
  defaultTaskStatus: TaskStatus;
  notificationPreferences: Record<NotificationType, boolean>;
}

// ─── User ─────────────────────────────────────────────────────────────────────

export interface User extends BaseEntity {
  email: string;
  name: string;
  avatarUrl: string | null;
  role: UserRole;
  orgId: string;
  departmentId: string | null;
  jobTitle: string | null;
  phone: string | null;
  bio: string | null;
  timezone: string | null;
  isOnboarded: boolean;
  isActive: boolean;
  lastActiveAt: Date | null;
}

export interface UserWithOrg extends User {
  organization: Organization;
  department: Department | null;
}

export interface UserProfile extends Omit<User, 'passwordHash' | 'hashedRt'> {
  organization: Pick<Organization, 'id' | 'name' | 'slug' | 'logoUrl'>;
}

// ─── Department ───────────────────────────────────────────────────────────────

export interface Department extends BaseEntity {
  name: string;
  description: string | null;
  orgId: string;
  headId: string | null;
  parentId: string | null;
}

export interface DepartmentWithMembers extends Department {
  head: Pick<User, 'id' | 'name' | 'avatarUrl' | 'email'> | null;
  members: Pick<User, 'id' | 'name' | 'avatarUrl' | 'email' | 'jobTitle'>[];
  _count: { members: number };
}

// ─── Invitation ───────────────────────────────────────────────────────────────

export interface Invitation extends BaseEntity {
  email: string;
  orgId: string;
  role: UserRole;
  token: string;
  expiresAt: Date;
  acceptedAt: Date | null;
  invitedById: string;
}

// ─── Project ──────────────────────────────────────────────────────────────────

export interface Project extends BaseEntity {
  name: string;
  description: string | null;
  orgId: string;
  status: ProjectStatus;
  color: string;
  icon: string | null;
  startDate: Date | null;
  dueDate: Date | null;
  ownerId: string;
  isPrivate: boolean;
}

export interface ProjectWithMeta extends Project {
  owner: Pick<User, 'id' | 'name' | 'avatarUrl'>;
  members: ProjectMember[];
  _count: { tasks: number; members: number };
  taskStats: {
    total: number;
    completed: number;
    inProgress: number;
    overdue: number;
  };
}

export interface ProjectMember {
  userId: string;
  projectId: string;
  role: 'OWNER' | 'ADMIN' | 'MEMBER' | 'VIEWER';
  user: Pick<User, 'id' | 'name' | 'avatarUrl' | 'email'>;
  joinedAt: Date;
}

// ─── Task ─────────────────────────────────────────────────────────────────────

export interface Task extends BaseEntity {
  title: string;
  description: string | null;
  projectId: string;
  assigneeId: string | null;
  reporterId: string;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate: Date | null;
  startDate: Date | null;
  estimatedHours: number | null;
  actualHours: number | null;
  labels: string[];
  order: number;
  parentId: string | null;
  completedAt: Date | null;
}

export interface TaskWithMeta extends Task {
  project: Pick<Project, 'id' | 'name' | 'color'>;
  assignee: Pick<User, 'id' | 'name' | 'avatarUrl'> | null;
  reporter: Pick<User, 'id' | 'name' | 'avatarUrl'>;
  comments: TaskComment[];
  attachments: TaskAttachment[];
  subTasks: Pick<Task, 'id' | 'title' | 'status'>[];
  _count: { comments: number; attachments: number; subTasks: number };
  activeTimer: TimerSessionPublic | null;
}

export interface TaskComment extends BaseEntity {
  taskId: string;
  authorId: string;
  content: string;
  editedAt: Date | null;
  author: Pick<User, 'id' | 'name' | 'avatarUrl'>;
}

export interface TaskAttachment extends BaseEntity {
  taskId: string;
  uploadedById: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
  url: string;
}

// ─── Time Tracking ────────────────────────────────────────────────────────────

export interface TimerSession extends BaseEntity {
  userId: string;
  taskId: string | null;
  state: TimerState;
  startedAt: Date;
  pausedAt: Date | null;
  stoppedAt: Date | null;
  totalPausedMs: number;
  notes: string | null;
}

export interface TimerSessionPublic extends TimerSession {
  /** Computed elapsed time in milliseconds (excluding paused duration) */
  elapsedMs: number;
  task: Pick<Task, 'id' | 'title' | 'priority'> | null;
  user: Pick<User, 'id' | 'name' | 'avatarUrl'>;
}

export interface TimeEntry extends BaseEntity {
  userId: string;
  taskId: string | null;
  projectId: string | null;
  timerSessionId: string | null;
  startTime: Date;
  endTime: Date;
  durationMs: number;
  notes: string | null;
  isBillable: boolean;
  isApproved: boolean;
  approvedById: string | null;
}

export interface TimeEntryWithMeta extends TimeEntry {
  task: Pick<Task, 'id' | 'title'> | null;
  project: Pick<Project, 'id' | 'name' | 'color'> | null;
  user: Pick<User, 'id' | 'name' | 'avatarUrl'>;
}

// ─── Timesheet ────────────────────────────────────────────────────────────────

export interface Timesheet extends BaseEntity {
  userId: string;
  orgId: string;
  weekStart: Date;
  weekEnd: Date;
  status: TimesheetStatus;
  submittedAt: Date | null;
  reviewedById: string | null;
  reviewedAt: Date | null;
  rejectionReason: string | null;
  totalHours: number;
}

export interface TimesheetWithEntries extends Timesheet {
  user: Pick<User, 'id' | 'name' | 'avatarUrl' | 'department'>;
  entries: TimeEntryWithMeta[];
  reviewer: Pick<User, 'id' | 'name'> | null;
}

// ─── Meeting ──────────────────────────────────────────────────────────────────

export interface Meeting extends BaseEntity {
  title: string;
  description: string | null;
  orgId: string;
  organizerId: string;
  startTime: Date;
  endTime: Date;
  location: string | null;
  meetingUrl: string | null;
  notes: string | null;
  isRecurring: boolean;
  recurringRule: string | null;
  calendarEventId: string | null;
  calendarProvider: CalendarProvider | null;
}

export interface MeetingWithAttendees extends Meeting {
  organizer: Pick<User, 'id' | 'name' | 'avatarUrl'>;
  attendees: MeetingAttendee[];
}

export interface MeetingAttendee {
  meetingId: string;
  userId: string;
  status: AttendeeStatus;
  user: Pick<User, 'id' | 'name' | 'avatarUrl' | 'email'>;
}

// ─── Notification ─────────────────────────────────────────────────────────────

export interface Notification extends BaseEntity {
  userId: string;
  type: NotificationType;
  title: string;
  body: string;
  data: Record<string, unknown>;
  readAt: Date | null;
  actorId: string | null;
}

export interface NotificationWithActor extends Notification {
  actor: Pick<User, 'id' | 'name' | 'avatarUrl'> | null;
}

// ─── Audit Log ────────────────────────────────────────────────────────────────

export interface AuditLog extends BaseEntity {
  orgId: string;
  actorId: string;
  action: AuditAction;
  targetType: string;
  targetId: string | null;
  changes: Record<string, { before: unknown; after: unknown }> | null;
  metadata: Record<string, unknown> | null;
  ipAddress: string | null;
  userAgent: string | null;
}

export interface AuditLogWithActor extends AuditLog {
  actor: Pick<User, 'id' | 'name' | 'avatarUrl'>;
}

// ─── Calendar Integration ─────────────────────────────────────────────────────

export interface CalendarIntegration extends BaseEntity {
  userId: string;
  orgId: string;
  provider: CalendarProvider;
  accessToken: string; // encrypted
  refreshToken: string; // encrypted
  tokenExpiresAt: Date;
  calendarId: string;
  isActive: boolean;
  lastSyncedAt: Date | null;
}

// ─── API Response Types ───────────────────────────────────────────────────────

export interface ApiResponse<T = void> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface PaginationQuery {
  page?: number;
  pageSize?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

// ─── Auth Types ───────────────────────────────────────────────────────────────

export interface AuthTokens {
  accessToken: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  name: string;
  organizationName: string;
  organizationSlug: string;
}

export interface JwtPayload {
  sub: string;       // userId
  email: string;
  orgId: string;
  role: UserRole;
  iat?: number;
  exp?: number;
}

// ─── Socket.IO Event Types ────────────────────────────────────────────────────

export interface SocketEvents {
  // Timer events
  'timer:started': TimerSessionPublic;
  'timer:paused': TimerSessionPublic;
  'timer:resumed': TimerSessionPublic;
  'timer:stopped': TimerSessionPublic & { timeEntry: TimeEntry };
  'timer:tick': { sessionId: string; elapsedMs: number };

  // Task events
  'task:created': TaskWithMeta;
  'task:updated': Partial<Task> & { id: string };
  'task:deleted': { id: string; projectId: string };
  'task:status-changed': { id: string; status: TaskStatus; updatedBy: string };

  // Presence events
  'presence:joined': { userId: string; name: string; avatarUrl: string | null };
  'presence:left': { userId: string };
  'presence:update': { userId: string; status: 'online' | 'away' | 'offline'; activeTaskId: string | null };

  // Notification events
  'notification:new': NotificationWithActor;
  'notification:read': { id: string };

  // Meeting events
  'meeting:reminder': Pick<Meeting, 'id' | 'title' | 'startTime'>;
}

// ─── Dashboard Stats Types ────────────────────────────────────────────────────

export interface EmployeeDashboardStats {
  activeTimer: TimerSessionPublic | null;
  todayHours: number;
  weekHours: number;
  openTasks: number;
  dueSoonTasks: TaskWithMeta[];
  recentActivity: AuditLog[];
}

export interface ManagerDashboardStats {
  teamSize: number;
  activeTimers: TimerSessionPublic[];
  teamHoursThisWeek: number;
  openTasksByStatus: Record<TaskStatus, number>;
  pendingTimesheets: number;
  projectHealth: Array<{
    project: Pick<Project, 'id' | 'name' | 'color'>;
    completionPercent: number;
    overdueTasks: number;
  }>;
}

// ─── Report Types ─────────────────────────────────────────────────────────────

export interface UtilizationReport {
  userId: string;
  user: Pick<User, 'id' | 'name' | 'avatarUrl'>;
  totalHours: number;
  billableHours: number;
  utilizationPercent: number;
  byProject: Array<{
    project: Pick<Project, 'id' | 'name' | 'color'>;
    hours: number;
    percent: number;
  }>;
}

export interface ProjectHoursReport {
  project: Pick<Project, 'id' | 'name' | 'color' | 'status'>;
  totalHours: number;
  estimatedHours: number;
  memberBreakdown: Array<{
    user: Pick<User, 'id' | 'name' | 'avatarUrl'>;
    hours: number;
  }>;
  weeklyTrend: Array<{ week: string; hours: number }>;
}
