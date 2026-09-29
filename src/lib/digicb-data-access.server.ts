// DigiCB data accessors + mutations. Server-only.
import { loadDB, saveDB, hashPassword, uid, logEntry } from "./digicb-store.server";
import type {
  SessionUser,
  User,
  Branch,
  Organization,
  Notification,
  Task,
  Approval,
  CalendarEvent,
  AuditLog,
  SafeUser,
} from "./digicb-types";
import { permsForRole, getRolesList } from "./digicb-roles";

export { DEMO_MODE } from "./digicb-store.server";

export function getDashboard(user: SessionUser) {
  const db = loadDB();
  const myTasks = db.tasks.filter((t) => t.assigneeId === user.id);
  const overdue = myTasks.filter((t) => t.status === "overdue").length;
  const pendingApprovals = db.approvals.filter(
    (a) => a.stage === "review" || a.stage === "changes",
  ).length;
  const unread = db.notifications.filter((n) => n.userId === user.id && !n.read).length;
  return {
    stats: [
      {
        label: "My open tasks",
        value: myTasks.filter((t) => t.status !== "done").length,
        tone: "info",
      },
      { label: "Overdue tasks", value: overdue, tone: "danger" },
      { label: "Pending approvals", value: pendingApprovals, tone: "warning" },
      { label: "Unread notifications", value: unread, tone: "info" },
      { label: "Open NCRs", value: 7, tone: "warning" },
      { label: "Certificates expiring", value: 3, tone: "warning" },
      { label: "Auth. expiring", value: 1, tone: "warning" },
      { label: "Complaints open", value: 2, tone: "danger" },
    ],
    recentActivity: db.auditLogs.slice(0, 6).map((l) => ({
      id: l.id,
      actor: l.actor,
      action: l.action,
      detail: l.detail,
      ts: new Date(l.ts).toISOString(),
    })),
    upcoming: db.calendar.slice(0, 5),
  };
}

export function getMyTasks(user: SessionUser): Task[] {
  return loadDB().tasks.filter((t) => t.assigneeId === user.id);
}

export function getApprovals(): Approval[] {
  return loadDB().approvals;
}

export function resolveApproval(id: string, stage: Approval["stage"], actor: string): Approval[] {
  const db = loadDB();
  const a = db.approvals.find((x) => x.id === id);
  if (a) {
    a.stage = stage;
    db.auditLogs.unshift(logEntry(actor, "approval.resolve", `${a.docNumber} → ${stage}`));
    saveDB();
  }
  return db.approvals;
}

export function getNotifications(user: SessionUser): Notification[] {
  return loadDB().notifications.filter((n) => n.userId === user.id);
}

export function markNotificationsRead(user: SessionUser, ids?: string[]): Notification[] {
  const db = loadDB();
  db.notifications
    .filter((n) => n.userId === user.id && (!ids || ids.includes(n.id)))
    .forEach((n) => (n.read = true));
  saveDB();
  return db.notifications.filter((n) => n.userId === user.id);
}

export function getCalendar(): CalendarEvent[] {
  return loadDB().calendar;
}

export function safeUser(u: User): SafeUser {
  const { passwordHash, mfaCode, ...rest } = u;
  return rest;
}

export function getUsers(): SafeUser[] {
  return loadDB().users.map(safeUser);
}

export function getUser(id: string): SessionUser | null {
  const u = loadDB().users.find((x) => x.id === id);
  return u
    ? {
        id: u.id,
        name: u.name,
        email: u.email,
        role: u.role,
        branchId: u.branchId,
        title: u.title,
        permissions: permsForRole(u.role),
        demo: u.demo,
        lastLogin: u.lastLogin,
      }
    : null;
}

export function updateProfile(
  id: string,
  patch: { name?: string; phone?: string; title?: string },
  actorEmail: string,
): SessionUser | null {
  const db = loadDB();
  const u = db.users.find((x) => x.id === id);
  if (!u) return null;
  if (patch.name !== undefined) u.name = patch.name;
  if (patch.phone !== undefined) u.phone = patch.phone;
  if (patch.title !== undefined) u.title = patch.title;
  db.auditLogs.unshift(logEntry(actorEmail, "user.profile_update", "Profile updated"));
  saveDB();
  return getUser(id);
}

export function changePassword(
  id: string,
  current: string,
  next: string,
): { ok: boolean; error?: string } {
  const db = loadDB();
  const u = db.users.find((x) => x.id === id);
  if (!u) return { ok: false, error: "User not found." };
  if (hashPassword(current) !== u.passwordHash)
    return { ok: false, error: "Current password is incorrect." };
  if (next.length < 8) return { ok: false, error: "New password must be at least 8 characters." };
  u.passwordHash = hashPassword(next);
  db.auditLogs.unshift(logEntry(u.email, "user.password_change", "Password changed"));
  saveDB();
  return { ok: true };
}

export function toggle2FA(id: string, enabled: boolean): SessionUser | null {
  const db = loadDB();
  const u = db.users.find((x) => x.id === id);
  if (!u) return null;
  u.mfaEnabled = enabled;
  if (enabled && !u.mfaCode) u.mfaCode = "123456";
  db.auditLogs.unshift(
    logEntry(u.email, "user.2fa_toggle", `2FA ${enabled ? "enabled" : "disabled"}`),
  );
  saveDB();
  return getUser(id);
}

export interface NewUserInput {
  name: string;
  email: string;
  password: string;
  role: string;
  branchId: string;
  title?: string;
  phone?: string;
}

export function createUser(
  input: NewUserInput,
  actor: string,
): { ok: boolean; error?: string; user?: SafeUser } {
  const db = loadDB();
  if (db.users.some((x) => x.email.toLowerCase() === input.email.toLowerCase())) {
    return { ok: false, error: "A user with this email already exists." };
  }
  if (input.password.length < 8)
    return { ok: false, error: "Password must be at least 8 characters." };
  const u: User = {
    id: uid("u"),
    name: input.name,
    email: input.email,
    passwordHash: hashPassword(input.password),
    role: input.role,
    branchId: input.branchId,
    status: "active",
    title: input.title,
    phone: input.phone,
    mfaEnabled: false,
    failedAttempts: 0,
    lockedUntil: null,
    lastLogin: null,
    createdAt: Date.now(),
    demo: false,
  };
  db.users.push(u);
  db.auditLogs.unshift(logEntry(actor, "user.create", `Created user ${u.email} (${u.role})`));
  saveDB();
  return { ok: true, user: safeUser(u) };
}

export function updateUser(
  id: string,
  patch: Partial<Pick<User, "name" | "role" | "branchId" | "title" | "phone" | "status">>,
  actor: string,
): { ok: boolean; error?: string } {
  const db = loadDB();
  const u = db.users.find((x) => x.id === id);
  if (!u) return { ok: false, error: "User not found." };
  Object.assign(u, patch);
  db.auditLogs.unshift(logEntry(actor, "user.update", `Updated ${u.email}`));
  saveDB();
  return { ok: true };
}

export function resetUserPassword(
  id: string,
  newPw: string,
  actor: string,
): { ok: boolean; error?: string } {
  const db = loadDB();
  const u = db.users.find((x) => x.id === id);
  if (!u) return { ok: false, error: "User not found." };
  if (newPw.length < 8) return { ok: false, error: "Password must be at least 8 characters." };
  u.passwordHash = hashPassword(newPw);
  u.failedAttempts = 0;
  u.lockedUntil = null;
  db.auditLogs.unshift(logEntry(actor, "user.password_reset", `Reset password for ${u.email}`));
  saveDB();
  return { ok: true };
}

export function getBranches(): Branch[] {
  return loadDB().branches;
}

export { getRolesList };

export function getOrg(): Organization {
  return loadDB().organization;
}

export function updateOrg(patch: Partial<Organization>, actor: string): Organization {
  const db = loadDB();
  Object.assign(db.organization, patch);
  db.auditLogs.unshift(logEntry(actor, "org.update", "Organization profile updated"));
  saveDB();
  return db.organization;
}

export function getAuditLogs(limit = 50): AuditLog[] {
  return loadDB().auditLogs.slice(0, limit);
}
