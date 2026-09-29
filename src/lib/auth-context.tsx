// DigiCB client auth context. Bootstraps the session on mount via a server
// function and exposes the current user + auth actions to the whole app.
import { createContext, useContext, useEffect, useState, type ReactNode, useCallback } from "react";
import { useServerFn } from "@tanstack/react-start";
import { getSessionFn, loginFn, verify2FAFn, logoutFn } from "@/lib/digicb.functions";
import type { SessionUser } from "@/lib/digicb-types";

interface AuthState {
  user: SessionUser | null;
  loading: boolean;
  signIn: (
    email: string,
    password: string,
    remember: boolean,
  ) => Promise<{ ok: boolean; error?: string; requires2FA?: boolean; challenge?: string }>;
  verifyCode: (
    challenge: string,
    code: string,
    remember: boolean,
  ) => Promise<{ ok: boolean; error?: string }>;
  signOut: () => Promise<void>;
  refresh: () => Promise<void>;
  setUser: (u: SessionUser | null) => void;
}

const AuthCtx = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<SessionUser | null>(null);
  const [loading, setLoading] = useState(true);

  const getSession = useServerFn(getSessionFn);
  const login = useServerFn(loginFn);
  const verify2FA = useServerFn(verify2FAFn);
  const logout = useServerFn(logoutFn);

  const refresh = useCallback(async () => {
    try {
      const res = await getSession();
      setUser(res.user);
    } catch {
      setUser(null);
    }
  }, [getSession]);

  useEffect(() => {
    refresh().finally(() => setLoading(false));
  }, [refresh]);

  const signIn = useCallback(
    async (email: string, password: string, remember: boolean) => {
      const res = await login({ data: { email, password, remember } });
      if (res.ok && res.user) setUser(res.user);
      return {
        ok: res.ok,
        error: res.error,
        requires2FA: res.requires2FA,
        challenge: res.challenge,
      };
    },
    [login],
  );

  const verifyCode = useCallback(
    async (challenge: string, code: string, remember: boolean) => {
      const res = await verify2FA({ data: { challenge, code, remember } });
      if (res.ok && res.user) setUser(res.user);
      return { ok: res.ok, error: res.error };
    },
    [verify2FA],
  );

  const signOut = useCallback(async () => {
    await logout();
    setUser(null);
  }, [logout]);

  return (
    <AuthCtx.Provider value={{ user, loading, signIn, verifyCode, signOut, refresh, setUser }}>
      {children}
    </AuthCtx.Provider>
  );
}

export function useAuth(): AuthState {
  const ctx = useContext(AuthCtx);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
