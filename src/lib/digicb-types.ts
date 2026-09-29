// DigiCB shared types for the server store.
export interface Branch {
  id: string;
  name: string;
  type: "head_office" | "national" | "international" | "remote" | "franchise";
  country: string;
  city: string;
  manager: string;
  status: "active" | "inactive";
}

export interface User {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  role: string;
  branchId: string;
  status: "active" | "inactive" | "locked";
  phone?: string;
  title?: string;
  mfaEnabled: boolean;
  mfaCode?: string;
  failedAttempts: number;
  lockedUntil: number | null;
  lastLogin: number | null;
  createdAt: number;
  demo: boolean;
}

export interface AuditLog {
  id: string;
  ts: number;
  actor: string;
  action: string;
  detail: string;
  ip?: string;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  body: string;
  category: string;
  read: boolean;
  ts: number;
  link?: string;
}

export interface Task {
  id: string;
  title: string;
  type: string;
  priority: "low" | "medium" | "high" | "urgent";
  due: string;
  status: "open" | "in_progress" | "done" | "overdue";
  assigneeId: string;
  related?: string;
}

export interface Approval {
  id: string;
  title: string;
  docNumber: string;
  type: string;
  submittedBy: string;
  submittedAt: string;
  stage: "review" | "feedback" | "changes" | "approved" | "rejected";
  framework: string;
}

export interface CalendarEvent {
  id: string;
  title: string;
  category: string;
  date: string;
  owner: string;
  recurrence: string;
  status: "scheduled" | "due" | "done";
}

export interface Organization {
  name: string;
  legalName: string;
  taxId: string;
  website: string;
  email: string;
  phone: string;
  address: string;
  logoText: string;
  primaryColor: string;
}

export interface SessionUser {
  id: string;
  name: string;
  email: string;
  role: string;
  branchId: string;
  title?: string;
  permissions: string[];
  demo: boolean;
  lastLogin: number | null;
}

export interface DB {
  organization: Organization;
  branches: Branch[];
  users: User[];
  auditLogs: AuditLog[];
  notifications: Notification[];
  tasks: Task[];
  approvals: Approval[];
  calendar: CalendarEvent[];
  sessions: Record<string, { userId: string; createdAt: number; expiresAt: number }>;
  challenges: Record<string, { userId: string; expiresAt: number }>;
}

// Safe user shape returned to the client (no secrets).
export type SafeUser = Omit<User, "passwordHash" | "mfaCode">;
