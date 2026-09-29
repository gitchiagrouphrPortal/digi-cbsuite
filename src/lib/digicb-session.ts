// DigiCB session cookie helpers using TanStack Start request utilities.
// Reads the Cookie header from the incoming request and writes Set-Cookie
// on the response, so the browser persists the session across navigations.
import { getRequest, getRequestHeader, setResponseHeader } from "@tanstack/react-start/server";

const SESSION_COOKIE = "digicb_session";

export function getCookie(name: string): string | undefined {
  try {
    const header = getRequestHeader("cookie");
    if (!header) return undefined;
    const match = header
      .split(";")
      .map((c) => c.trim())
      .find((c) => c.startsWith(name + "="));
    return match ? decodeURIComponent(match.slice(name.length + 1)) : undefined;
  } catch {
    return undefined;
  }
}

export function setCookie(name: string, value: string): void {
  try {
    const req = getRequest();
    const isSecure = req?.url?.startsWith("https") ?? false;
    setResponseHeader(
      "set-cookie",
      `${name}=${encodeURIComponent(value)}; Path=/; HttpOnly; SameSite=Lax; Max-Age=2592000${isSecure ? "; Secure" : ""}`,
    );
  } catch {
    /* no request context (e.g. prerender) — ignore */
  }
}

export function deleteCookie(name: string): void {
  try {
    setResponseHeader("set-cookie", `${name}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0`);
  } catch {
    /* ignore */
  }
}
