// DigiCB server functions — thin RPC wrappers over the server store.
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { getCookie, setCookie, deleteCookie } from "./digicb-session";
import { login, verify2FA, logout, getSession, recordLoginFail } from "./digicb-auth.server";
import {
  getDashboard,
  getMyTasks,
  getApprovals,
  resolveApproval,
  getNotifications,
  markNotificationsRead,
  getCalendar,
  getUsers,
  getUser,
  updateProfile,
  changePassword,
  toggle2FA,
  createUser,
  updateUser,
  resetUserPassword,
  getBranches,
  getRolesList,
  getOrg,
  updateOrg,
  getAuditLogs,
  type NewUserInput,
  type SafeUser,
} from "./digicb-data-access.server";
import type { SessionUser } from "./digicb-types";

const SESSION_COOKIE = "digicb_session";

function requireUser(): SessionUser {
  const token = getCookie(SESSION_COOKIE);
  const user = getSession(token);
  if (!user) throw new Error("UNAUTHORIZED");
  return user;
}

// ---------- Auth ----------
export const loginFn = createServerFn({ method: "POST" })
  .validator((data) =>
    z
      .object({ email: z.string().email(), password: z.string().min(1), remember: z.boolean() })
      .parse(data),
  )
  .handler(async ({ data }) => {
    const res = login(data.email, data.password, data.remember);
    if (res.ok && res.user && res.token) {
      setCookie(SESSION_COOKIE, res.token);
      return { ok: true, user: res.user };
    }
    if (!res.ok && res.error && !res.lockedUntil) recordLoginFail(data.email);
    return res;
  });

export const verify2FAFn = createServerFn({ method: "POST" })
  .validator((data) =>
    z
      .object({ challenge: z.string().min(1), code: z.string().min(4), remember: z.boolean() })
      .parse(data),
  )
  .handler(async ({ data }) => {
    const res = verify2FA(data.challenge, data.code, data.remember);
    if (res.ok && res.user && res.token) {
      setCookie(SESSION_COOKIE, res.token);
      return { ok: true, user: res.user };
    }
    return res;
  });

export const getSessionFn = createServerFn({ method: "GET" }).handler(async () => {
  const token = getCookie(SESSION_COOKIE);
  return { user: getSession(token) };
});

export const logoutFn = createServerFn({ method: "POST" }).handler(async () => {
  const token = getCookie(SESSION_COOKIE);
  logout(token);
  deleteCookie(SESSION_COOKIE);
  return { ok: true };
});

// ---------- Dashboard ----------
export const getDashboardFn = createServerFn({ method: "GET" }).handler(async () => {
  const user = requireUser();
  return getDashboard(user);
});

// ---------- Tasks ----------
export const getMyTasksFn = createServerFn({ method: "GET" }).handler(async () => {
  const user = requireUser();
  return getMyTasks(user);
});

// ---------- Approvals ----------
export const getApprovalsFn = createServerFn({ method: "GET" }).handler(async () => {
  requireUser();
  return getApprovals();
});

export const resolveApprovalFn = createServerFn({ method: "POST" })
  .validator((data) =>
    z
      .object({
        id: z.string(),
        stage: z.enum(["review", "feedback", "changes", "approved", "rejected"]),
      })
      .parse(data),
  )
  .handler(async ({ data }) => {
    const user = requireUser();
    return resolveApproval(data.id, data.stage, user.email);
  });

// ---------- Notifications ----------
export const getNotificationsFn = createServerFn({ method: "GET" }).handler(async () => {
  const user = requireUser();
  return getNotifications(user);
});

export const markNotificationsReadFn = createServerFn({ method: "POST" })
  .validator((data) => z.object({ ids: z.array(z.string()).optional() }).parse(data))
  .handler(async ({ data }) => {
    const user = requireUser();
    return markNotificationsRead(user, data.ids);
  });

// ---------- Calendar ----------
export const getCalendarFn = createServerFn({ method: "GET" }).handler(async () => {
  requireUser();
  return getCalendar();
});

// ---------- Profile ----------
export const getProfileFn = createServerFn({ method: "GET" }).handler(async () => {
  const user = requireUser();
  return getUser(user.id);
});

export const updateProfileFn = createServerFn({ method: "POST" })
  .validator((data) =>
    z
      .object({
        name: z.string().optional(),
        phone: z.string().optional(),
        title: z.string().optional(),
      })
      .parse(data),
  )
  .handler(async ({ data }) => {
    const user = requireUser();
    return updateProfile(user.id, data, user.email);
  });

export const changePasswordFn = createServerFn({ method: "POST" })
  .validator((data) => z.object({ current: z.string(), next: z.string() }).parse(data))
  .handler(async ({ data }) => {
    const user = requireUser();
    return changePassword(user.id, data.current, data.next);
  });

export const toggle2FAFn = createServerFn({ method: "POST" })
  .validator((data) => z.object({ enabled: z.boolean() }).parse(data))
  .handler(async ({ data }) => {
    const user = requireUser();
    return toggle2FA(user.id, data.enabled);
  });

// ---------- Admin: users ----------
export const getUsersFn = createServerFn({ method: "GET" }).handler(async () => {
  requireUser();
  return getUsers() as SafeUser[];
});

export const createUserFn = createServerFn({ method: "POST" })
  .validator((data) =>
    z
      .object({
        name: z.string().min(1),
        email: z.string().email(),
        password: z.string().min(8),
        role: z.string(),
        branchId: z.string(),
        title: z.string().optional(),
        phone: z.string().optional(),
      })
      .parse(data as NewUserInput),
  )
  .handler(async ({ data }) => {
    const user = requireUser();
    return createUser(data, user.email);
  });

export const updateUserFn = createServerFn({ method: "POST" })
  .validator((data) =>
    z
      .object({
        id: z.string(),
        name: z.string().optional(),
        role: z.string().optional(),
        branchId: z.string().optional(),
        title: z.string().optional(),
        phone: z.string().optional(),
        status: z.string().optional(),
      })
      .parse(data),
  )
  .handler(async ({ data }) => {
    const user = requireUser();
    return updateUser(data.id, data, user.email);
  });

export const resetUserPasswordFn = createServerFn({ method: "POST" })
  .validator((data) => z.object({ id: z.string(), password: z.string().min(8) }).parse(data))
  .handler(async ({ data }) => {
    const user = requireUser();
    return resetUserPassword(data.id, data.password, user.email);
  });

// ---------- Admin: branches / org / audit ----------
export const getBranchesFn = createServerFn({ method: "GET" }).handler(async () => {
  requireUser();
  return getBranches();
});

export const getRolesListFn = createServerFn({ method: "GET" }).handler(async () => {
  requireUser();
  return getRolesList();
});

export const getOrgFn = createServerFn({ method: "GET" }).handler(async () => {
  requireUser();
  return getOrg();
});

export const updateOrgFn = createServerFn({ method: "POST" })
  .validator((data) =>
    z
      .object({
        name: z.string().optional(),
        legalName: z.string().optional(),
        taxId: z.string().optional(),
        website: z.string().optional(),
        email: z.string().optional(),
        phone: z.string().optional(),
        address: z.string().optional(),
      })
      .parse(data),
  )
  .handler(async ({ data }) => {
    const user = requireUser();
    return updateOrg(data, user.email);
  });

export const getAuditLogsFn = createServerFn({ method: "GET" }).handler(async () => {
  requireUser();
  return getAuditLogs(50);
});
