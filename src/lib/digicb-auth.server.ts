// DigiCB auth logic: login, 2FA, sessions. Server-only.
import {
  loadDB,
  saveDB,
  hashPassword,
  uid,
  now,
  logEntry,
  SESSION_MAX_AGE,
  LOCK_THRESHOLD,
  LOCK_MINUTES,
} from "./digicb-store.server";
import type { SessionUser, User } from "./digicb-types";
import { permsForRole } from "./digicb-roles";

export function toSessionUser(u: User): SessionUser {
  return {
    id: u.id,
    name: u.name,
    email: u.email,
    role: u.role,
    branchId: u.branchId,
    title: u.title,
    permissions: permsForRole(u.role),
    demo: u.demo,
    lastLogin: u.lastLogin,
  };
}

export interface LoginResult {
  ok: boolean;
  error?: string;
  requires2FA?: boolean;
  challenge?: string;
  user?: SessionUser;
  token?: string;
  lockedUntil?: number;
}

export function login(email: string, password: string, remember: boolean): LoginResult {
  const db = loadDB();
  const u = db.users.find((x) => x.email.toLowerCase() === email.toLowerCase());
  if (!u) return { ok: false, error: "Invalid email or password." };
  if (u.status === "inactive")
    return { ok: false, error: "This account is inactive. Contact your administrator." };
  if (u.lockedUntil && u.lockedUntil > now()) {
    return {
      ok: false,
      error: "Account temporarily locked due to repeated failed attempts.",
      lockedUntil: u.lockedUntil,
    };
  }
  if (u.lockedUntil && u.lockedUntil <= now()) {
    u.lockedUntil = null;
    u.failedAttempts = 0;
  }
  if (hashPassword(password) !== u.passwordHash) {
    u.failedAttempts += 1;
    if (u.failedAttempts >= LOCK_THRESHOLD) {
      u.lockedUntil = now() + LOCK_MINUTES * 60 * 1000;
      db.auditLogs.unshift(
        logEntry(u.email, "auth.locked", `Account locked after ${LOCK_THRESHOLD} failed attempts`),
      );
    }
    saveDB();
    return { ok: false, error: "Invalid email or password.", lockedUntil: u.lockedUntil };
  }
  if (u.mfaEnabled) {
    const challenge = uid("ch");
    db.challenges[challenge] = { userId: u.id, expiresAt: now() + 5 * 60 * 1000 };
    saveDB();
    return { ok: true, requires2FA: true, challenge };
  }
  const token = createSession(u, remember);
  saveDB();
  return { ok: true, user: toSessionUser(u), token };
}

export function verify2FA(challenge: string, code: string, remember: boolean): LoginResult {
  const db = loadDB();
  const ch = db.challenges[challenge];
  if (!ch || ch.expiresAt < now())
    return { ok: false, error: "Verification challenge expired. Please sign in again." };
  const u = db.users.find((x) => x.id === ch.userId);
  if (!u) return { ok: false, error: "Account not found." };
  // Accept the user's configured authenticator code. The fixed demo code
  // "123456" is only honoured for seeded demo accounts (u.demo === true), so
  // it can never unlock a real production account regardless of env flags.
  const isDemoCode = code === "123456";
  if (code !== u.mfaCode && !(isDemoCode && u.demo))
    return { ok: false, error: "Incorrect verification code." };
  delete db.challenges[challenge];
  const token = createSession(u, remember);
  saveDB();
  return { ok: true, user: toSessionUser(u), token };
}

function createSession(u: User, remember: boolean): string {
  const db = loadDB();
  const token = uid("sess");
  db.sessions[token] = {
    userId: u.id,
    createdAt: now(),
    expiresAt: now() + (remember ? SESSION_MAX_AGE * 4 : SESSION_MAX_AGE) * 1000,
  };
  u.failedAttempts = 0;
  u.lockedUntil = null;
  u.lastLogin = now();
  db.auditLogs.unshift(logEntry(u.email, "auth.login", "User signed in successfully"));
  return token;
}

export function logout(token: string | undefined): void {
  const db = loadDB();
  if (token && db.sessions[token]) {
    const u = db.users.find((x) => x.id === db.sessions[token].userId);
    delete db.sessions[token];
    if (u) db.auditLogs.unshift(logEntry(u.email, "auth.logout", "User signed out"));
    saveDB();
  }
}

export function getSession(token: string | undefined): SessionUser | null {
  if (!token) return null;
  const db = loadDB();
  const s = db.sessions[token];
  if (!s) return null;
  if (s.expiresAt < now()) {
    delete db.sessions[token];
    saveDB();
    return null;
  }
  const u = db.users.find((x) => x.id === s.userId);
  if (!u || u.status === "inactive") return null;
  return toSessionUser(u);
}

export function recordLoginFail(email: string): void {
  const db = loadDB();
  db.auditLogs.unshift(logEntry(email, "auth.login_failed", "Failed login attempt"));
  saveDB();
}
