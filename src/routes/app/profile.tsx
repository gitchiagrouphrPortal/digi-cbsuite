import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import {
  getProfileFn,
  updateProfileFn,
  changePasswordFn,
  toggle2FAFn,
} from "@/lib/digicb.functions";
import { useAuth } from "@/lib/auth-context";
import { toast } from "sonner";
import { AppPageHeader, Card, SectionTitle, Pill } from "@/components/app-primitives";
import type { SessionUser } from "@/lib/digicb-types";

export const Route = createFileRoute("/app/profile")({
  head: () => ({ meta: [{ title: "Profile & Security — DigiCB" }] }),
  component: ProfilePage,
});

function ProfilePage() {
  const { user, setUser, refresh } = useAuth();
  const navigate = useNavigate();
  const getProfile = useServerFn(getProfileFn);
  const updateProfile = useServerFn(updateProfileFn);
  const changePassword = useServerFn(changePasswordFn);
  const toggle2FA = useServerFn(toggle2FAFn);

  const [profile, setProfile] = useState<SessionUser | null>(null);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [title, setTitle] = useState("");
  const [cur, setCur] = useState("");
  const [next, setNext] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let active = true;
    getProfile()
      .then((p) => {
        if (!active || !p) return;
        setProfile(p);
        setName(p.name);
        setTitle(p.title ?? "");
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, [getProfile]);

  const saveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const updated = await updateProfile({ data: { name, phone, title } });
      if (updated) {
        setProfile(updated);
        setUser(updated);
        toast.success("Profile updated");
      }
    } catch {
      toast.error("Could not update profile");
    }
    setSaving(false);
  };

  const doChangePw = async (e: React.FormEvent) => {
    e.preventDefault();
    if (next.length < 8) {
      toast.error("New password must be at least 8 characters");
      return;
    }
    setSaving(true);
    try {
      const res = await changePassword({ data: { current: cur, next } });
      if (res.ok) {
        toast.success("Password changed");
        setCur("");
        setNext("");
      } else toast.error(res.error ?? "Could not change password");
    } catch {
      toast.error("Could not change password");
    }
    setSaving(false);
  };

  const doToggle2FA = async () => {
    if (!profile) return;
    try {
      const updated = await toggle2FA({ data: { enabled: !profile.mfaEnabled ?? false } });
      if (updated) {
        setProfile(updated);
        setUser(updated);
        toast.success(`Two-step verification ${updated.mfaEnabled ? "enabled" : "disabled"}`);
      }
    } catch {
      toast.error("Could not toggle 2FA");
    }
  };

  if (!profile && !user) {
    return <p className="text-sm text-muted-foreground">Loading…</p>;
  }
  const u = profile ?? user!;

  return (
    <div>
      <AppPageHeader
        title="Profile & Security"
        description="Manage your account details, password and two-step verification."
      />
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <SectionTitle>Account</SectionTitle>
          <dl className="mt-4 space-y-2 text-sm">
            <Row label="Email" value={u.email} />
            <Row label="Role" value={<Pill tone="info">{u.role}</Pill>} />
            <Row label="Status" value={<Pill tone="success">Active</Pill>} />
            <Row
              label="Last login"
              value={u.lastLogin ? new Date(u.lastLogin).toLocaleString() : "—"}
            />
            {u.demo && (
              <Row
                label="Account type"
                value={
                  <span className="font-semibold text-warning">DEMO — not for production</span>
                }
              />
            )}
          </dl>
          <form onSubmit={saveProfile} className="mt-6 space-y-3">
            <Field label="Full name">
              <input value={name} onChange={(e) => setName(e.target.value)} className="input" />
            </Field>
            <Field label="Title">
              <input value={title} onChange={(e) => setTitle(e.target.value)} className="input" />
            </Field>
            <Field label="Phone">
              <input
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="input"
                placeholder="+971 4 000 0000"
              />
            </Field>
            <button disabled={saving} className="btn-primary">
              {saving ? "Saving…" : "Save profile"}
            </button>
          </form>
        </Card>

        <div className="space-y-6">
          <Card>
            <SectionTitle>Change password</SectionTitle>
            <form onSubmit={doChangePw} className="mt-4 space-y-3">
              <Field label="Current password">
                <input
                  type="password"
                  value={cur}
                  onChange={(e) => setCur(e.target.value)}
                  className="input"
                  autoComplete="current-password"
                />
              </Field>
              <Field label="New password">
                <input
                  type="password"
                  value={next}
                  onChange={(e) => setNext(e.target.value)}
                  className="input"
                  autoComplete="new-password"
                />
              </Field>
              <p className="text-xs text-muted-foreground">
                Minimum 8 characters. Strong passwords recommended.
              </p>
              <button disabled={saving} className="btn-primary">
                {saving ? "Saving…" : "Change password"}
              </button>
            </form>
          </Card>

          <Card>
            <div className="flex items-center justify-between">
              <SectionTitle>Two-step verification</SectionTitle>
              <Pill tone={u.mfaEnabled ? "success" : "muted"}>
                {u.mfaEnabled ? "Enabled" : "Disabled"}
              </Pill>
            </div>
            <p className="mt-2 text-sm text-muted-foreground">
              Mandatory two-factor authentication for privileged accounts. In demo mode the
              verification code is{" "}
              <span className="font-mono font-semibold text-foreground">123456</span>.
            </p>
            <button onClick={doToggle2FA} className="btn-secondary mt-4">
              {u.mfaEnabled ? "Disable 2FA" : "Enable 2FA"}
            </button>
          </Card>

          <Card>
            <SectionTitle>Session</SectionTitle>
            <button
              onClick={async () => {
                await refresh();
                navigate({ to: "/login" });
              }}
              className="btn-secondary"
            >
              Refresh session
            </button>
          </Card>
        </div>
      </div>

      <style>{`
        .input { width:100%; border-radius:0.375rem; border:1px solid var(--color-input); background:var(--color-background); padding:0.5rem 0.75rem; font-size:0.875rem; outline:none; }
        .input:focus { box-shadow:0 0 0 2px var(--color-ring); }
        .btn-primary { display:inline-flex; height:2.5rem; align-items:center; justify-content:center; border-radius:0.375rem; background:var(--color-primary); padding:0 1rem; font-size:0.875rem; font-weight:600; color:var(--color-primary-foreground); }
        .btn-primary:hover { background:color-mix(in oklab, var(--color-primary) 90%, white); }
        .btn-secondary { display:inline-flex; height:2.5rem; align-items:center; justify-content:center; border-radius:0.375rem; border:1px solid var(--color-input); background:var(--color-card); padding:0 1rem; font-size:0.875rem; font-weight:600; color:var(--color-foreground); }
        .btn-secondary:hover { background:var(--color-accent); }
      `}</style>
    </div>
  );
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between border-b border-border py-1.5">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="font-medium text-foreground">{value}</dd>
    </div>
  );
}
function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-semibold text-foreground">{label}</span>
      {children}
    </label>
  );
}
