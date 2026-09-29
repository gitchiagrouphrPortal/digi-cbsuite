// DigiCB Conformity — auth helper for server functions.
// Extracted from conformity.functions.ts so the tss-serverfn-split transform
// doesn't drop it as a sibling helper (which caused ReferenceError → empty pages).
import { getCookie } from "./digicb-session";
import { getSession } from "./digicb-auth.server";
import type { SessionUser } from "./digicb-types";

const SESSION_COOKIE = "digicb_session";

// Read-only conformity data is gated behind the authenticated /app layout.
// Reads are best-effort authenticated: we never throw on a missing session
// in the server-fn RPC context (the cookie header isn't always forwarded),
// which previously left every submodule page stuck on "Loading…".
// Mutations still require a real user (checked in the handler).
export function currentUser(): SessionUser | null {
  try {
    const token = getCookie(SESSION_COOKIE);
    const user = getSession(token);
    return user ?? null;
  } catch {
    return null;
  }
}
