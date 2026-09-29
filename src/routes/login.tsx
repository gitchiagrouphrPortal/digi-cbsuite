import { createFileRoute, redirect, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import {
  ShieldCheck,
  Eye,
  EyeOff,
  Loader2,
  AlertCircle,
  Copy,
  KeyRound,
  ArrowLeft,
  FlaskConical,
} from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { toast } from "sonner";
import { getSessionFn } from "@/lib/digicb.functions";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Sign in — DigiCB" },
      {
        name: "description",
        content: "Sign in to DigiCB, the certification body management system.",
      },
      { property: "og:title", content: "Sign in — DigiCB" },
      {
        property: "og:description",
        content: "DigiCB certification body management system sign-in.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  beforeLoad: async () => {
    // Already authenticated? Go to dashboard.
    const res = await getSessionFn();
    if (res.user) throw redirect({ to: "/app/dashboard" });
  },
  component: LoginPage,
});

function LoginPage() {
  const { signIn, verifyCode, user } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [remember, setRemember] = useState(true);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [stage, setStage] = useState<"credentials" | "2fa">("credentials");
  const [challenge, setChallenge] = useState("");
  const [code, setCode] = useState("");

  useEffect(() => {
    if (user) navigate({ to: "/app/dashboard" });
  }, [user, navigate]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!email || !password) {
      setError("Please enter your email and password.");
      return;
    }
    setLoading(true);
    try {
      const res = await signIn(email.trim(), password, remember);
      if (!res.ok) {
        setError(res.error ?? "Sign-in failed.");
        setLoading(false);
        return;
      }
      if (res.requires2FA && res.challenge) {
        setChallenge(res.challenge);
        setStage("2fa");
        setLoading(false);
        return;
      }
      toast.success("Welcome to DigiCB");
      navigate({ to: "/app/dashboard" });
    } catch {
      setError("Something went wrong. Please try again.");
      setLoading(false);
    }
  };

  const submit2FA = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (code.length < 4) {
      setError("Enter the 6-digit verification code.");
      return;
    }
    setLoading(true);
    try {
      const res = await verifyCode(challenge, code.trim(), remember);
      if (!res.ok) {
        setError(res.error ?? "Verification failed.");
        setLoading(false);
        return;
      }
      toast.success("Welcome to DigiCB");
      navigate({ to: "/app/dashboard" });
    } catch {
      setError("Verification failed.");
      setLoading(false);
    }
  };

  const copy = (text: string) => {
    try {
      navigator.clipboard.writeText(text);
      toast.success("Copied to clipboard");
    } catch {
      /* ignore */
    }
  };

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      {/* Brand panel */}
      <div className="relative hidden flex-col justify-between overflow-hidden bg-primary p-12 text-primary-foreground lg:flex">
        <div className="grid-paper absolute inset-0 opacity-20" aria-hidden />
        <div className="relative flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary-foreground/15 backdrop-blur">
            <ShieldCheck className="h-6 w-6" />
          </div>
          <div>
            <p className="font-display text-xl font-bold tracking-tight">DigiCB</p>
            <p className="text-xs uppercase tracking-widest text-primary-foreground/70">
              Certification Body OS
            </p>
          </div>
        </div>
        <div className="relative max-w-md">
          <h2 className="font-display text-3xl font-bold leading-tight">
            The operating system for accredited conformity assessment.
          </h2>
          <p className="mt-4 text-sm text-primary-foreground/80">
            Management-system, Halal, personnel and product certification — built on four
            accreditation frameworks with secure multi-tenant isolation, audit trails and
            segregation of duties.
          </p>
          <div className="mt-8 flex flex-wrap gap-2">
            {["ISO/IEC 17021-1", "PS 4992", "ISO/IEC 17024", "ISO/IEC 17065"].map((f) => (
              <span
                key={f}
                className="rounded-full border border-primary-foreground/20 bg-primary-foreground/10 px-3 py-1 font-mono text-[11px]"
              >
                {f}
              </span>
            ))}
          </div>
        </div>
        <p className="relative text-xs text-primary-foreground/60">
          IAF archived 1 Jan 2026 · Global ACI documents maintained alongside legacy IAF.
        </p>
      </div>

      {/* Form panel */}
      <div className="flex items-center justify-center bg-background px-4 py-10 sm:px-8">
        <div className="w-full max-w-sm">
          <div className="mb-8 flex items-center gap-2.5 lg:hidden">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <p className="font-display text-lg font-bold text-foreground">DigiCB</p>
              <p className="text-[10px] uppercase tracking-widest text-muted-foreground">
                Certification Body Management System
              </p>
            </div>
          </div>

          {stage === "credentials" ? (
            <>
              <h1 className="font-display text-2xl font-bold tracking-tight text-foreground">
                Sign in
              </h1>
              <p className="mt-1.5 text-sm text-muted-foreground">
                Enter your credentials to access your workspace.
              </p>

              {error && (
                <div className="mt-4 flex items-start gap-2 rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2.5 text-sm text-destructive">
                  <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" /> <span>{error}</span>
                </div>
              )}

              <form onSubmit={submit} className="mt-6 space-y-4">
                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-foreground">
                    Email
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    autoComplete="email"
                    placeholder="you@digicb.test"
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-foreground">
                    Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPw ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      autoComplete="current-password"
                      placeholder="••••••••"
                      className="w-full rounded-md border border-input bg-background px-3 py-2 pr-10 text-sm outline-none focus:ring-2 focus:ring-ring"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPw((v) => !v)}
                      className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-muted-foreground hover:text-foreground"
                      aria-label={showPw ? "Hide password" : "Show password"}
                    >
                      {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-2 text-sm text-foreground">
                    <input
                      type="checkbox"
                      checked={remember}
                      onChange={(e) => setRemember(e.target.checked)}
                      className="h-4 w-4 rounded border-input accent-primary"
                    />
                    Remember me
                  </label>
                  <button
                    type="button"
                    onClick={() =>
                      toast.info("Password reset link will be emailed in a later phase")
                    }
                    className="text-sm font-medium text-primary hover:underline"
                  >
                    Forgot password?
                  </button>
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-md bg-primary text-sm font-semibold text-primary-foreground transition hover:bg-primary/90 disabled:opacity-60"
                >
                  {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                  Sign in
                </button>
              </form>

              {/* Demo access */}
              <div className="mt-6 rounded-lg border border-warning/30 bg-warning/5 p-4">
                <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-warning">
                  <FlaskConical className="h-3.5 w-3.5" /> Demo Access
                </div>
                <p className="mt-1 text-[11px] font-semibold uppercase tracking-wide text-destructive">
                  ⚠ Test account — not for production
                </p>
                <div className="mt-3 space-y-2 text-sm">
                  <div className="flex items-center justify-between rounded-md border border-border bg-card px-3 py-1.5">
                    <span className="font-mono text-xs text-foreground">admin@digicb.test</span>
                    <button
                      onClick={() => copy("admin@digicb.test")}
                      className="rounded p-1 text-muted-foreground hover:text-foreground"
                      aria-label="Copy email"
                    >
                      <Copy className="h-3.5 w-3.5" />
                    </button>
                  </div>
                  <div className="flex items-center justify-between rounded-md border border-border bg-card px-3 py-1.5">
                    <span className="font-mono text-xs text-foreground">DigiCB@Test2026!</span>
                    <button
                      onClick={() => copy("DigiCB@Test2026!")}
                      className="rounded p-1 text-muted-foreground hover:text-foreground"
                      aria-label="Copy password"
                    >
                      <Copy className="h-3.5 w-3.5" />
                    </button>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setEmail("admin@digicb.test");
                      setPassword("DigiCB@Test2026!");
                      toast.success("Demo credentials filled");
                    }}
                    className="w-full rounded-md border border-input bg-background py-1.5 text-xs font-medium text-foreground hover:bg-accent"
                  >
                    Fill demo credentials
                  </button>
                  <p className="text-[11px] text-muted-foreground">
                    2-step verification uses code{" "}
                    <span className="font-mono font-semibold text-foreground">123456</span> in demo
                    mode only.
                  </p>
                </div>
              </div>
            </>
          ) : (
            <>
              <button
                onClick={() => {
                  setStage("credentials");
                  setError("");
                  setCode("");
                }}
                className="mb-4 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
              >
                <ArrowLeft className="h-4 w-4" /> Back
              </button>
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <KeyRound className="h-6 w-6" />
              </div>
              <h1 className="mt-4 font-display text-2xl font-bold tracking-tight text-foreground">
                Two-step verification
              </h1>
              <p className="mt-1.5 text-sm text-muted-foreground">
                Enter the 6-digit code from your authenticator. Demo code:{" "}
                <span className="font-mono font-semibold text-foreground">123456</span>
              </p>
              {error && (
                <div className="mt-4 flex items-start gap-2 rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2.5 text-sm text-destructive">
                  <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" /> <span>{error}</span>
                </div>
              )}
              <form onSubmit={submit2FA} className="mt-6 space-y-4">
                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-foreground">
                    Verification code
                  </label>
                  <input
                    inputMode="numeric"
                    maxLength={6}
                    value={code}
                    onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
                    placeholder="123456"
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-center font-mono text-lg tracking-[0.4em] outline-none focus:ring-2 focus:ring-ring"
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-md bg-primary text-sm font-semibold text-primary-foreground transition hover:bg-primary/90 disabled:opacity-60"
                >
                  {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                  Verify
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
