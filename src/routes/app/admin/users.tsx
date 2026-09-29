import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import {
  getUsersFn,
  createUserFn,
  updateUserFn,
  resetUserPasswordFn,
  getBranchesFn,
  getRolesListFn,
} from "@/lib/digicb.functions";
import { useAuth } from "@/lib/auth-context";
import { toast } from "sonner";
import { AppPageHeader, Card, DataTable, EmptyState, Pill } from "@/components/app-primitives";
import type { SafeUser } from "@/lib/digicb-types";
import { X } from "lucide-react";

export const Route = createFileRoute("/app/admin/users")({
  head: () => ({ meta: [{ title: "User Management — DigiCB" }] }),
  component: UsersPage,
});

function UsersPage() {
  const { user: me } = useAuth();
  const getUsers = useServerFn(getUsersFn);
  const createUser = useServerFn(createUserFn);
  const updateUser = useServerFn(updateUserFn);
  const resetPw = useServerFn(resetUserPasswordFn);
  const getBranches = useServerFn(getBranchesFn);
  const getRoles = useServerFn(getRolesListFn);

  const [users, setUsers] = useState<SafeUser[] | null>(null);
  const [branches, setBranches] = useState<{ id: string; name: string }[]>([]);
  const [roles, setRoles] = useState<string[]>([]);
  const [query, setQuery] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [resetTarget, setResetTarget] = useState<SafeUser | null>(null);

  useEffect(() => {
    let active = true;
    getUsers()
      .then((u) => active && setUsers(u))
      .catch(() => {});
    getBranches()
      .then((b) => active && setBranches(b.map((x) => ({ id: x.id, name: x.name }))))
      .catch(() => {});
    getRoles()
      .then((r) => active && setRoles(r))
      .catch(() => {});
    return () => {
      active = false;
    };
  }, [getUsers, getBranches, getRoles]);

  const filtered = (users ?? []).filter(
    (u) =>
      u.name.toLowerCase().includes(query.toLowerCase()) ||
      u.email.toLowerCase().includes(query.toLowerCase()),
  );

  const branchName = (id: string) => branches.find((b) => b.id === id)?.name ?? id;

  return (
    <div>
      <AppPageHeader
        title="User Management"
        description="Create and manage user accounts, roles, branches and status. All changes are audit-logged."
      >
        <button
          onClick={() => setShowForm(true)}
          className="inline-flex h-9 items-center gap-1.5 rounded-md bg-primary px-4 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
        >
          New user
        </button>
      </AppPageHeader>

      <Card>
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by name or email…"
          className="mb-4 w-full max-w-xs rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
        />
        {!users ? (
          <p className="text-sm text-muted-foreground">Loading…</p>
        ) : filtered.length === 0 ? (
          <EmptyState title="No users found" />
        ) : (
          <DataTable
            headers={["Name", "Email", "Role", "Branch", "Status", "2FA", "Actions"]}
            rows={filtered.map((u) => [
              <div>
                <p className="font-medium text-foreground">{u.name}</p>
                {u.demo && (
                  <span className="text-[10px] font-semibold uppercase text-warning">demo</span>
                )}
              </div>,
              <span className="text-muted-foreground">{u.email}</span>,
              <span className="text-foreground">{u.role}</span>,
              <span className="text-muted-foreground">{branchName(u.branchId)}</span>,
              <Pill tone={u.status === "active" ? "success" : "muted"}>{u.status}</Pill>,
              <Pill tone={u.mfaEnabled ? "success" : "muted"}>{u.mfaEnabled ? "On" : "Off"}</Pill>,
              <div className="flex gap-1.5">
                <select
                  value={u.status}
                  onChange={async (e) => {
                    try {
                      await updateUser({ data: { id: u.id, status: e.target.value } });
                      toast.success("Status updated");
                      const list = await getUsers();
                      setUsers(list);
                    } catch {
                      toast.error("Failed");
                    }
                  }}
                  className="rounded-md border border-input bg-background px-2 py-1 text-xs"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
                <button
                  onClick={() => setResetTarget(u)}
                  className="rounded-md border border-input bg-card px-2.5 py-1 text-xs font-medium text-foreground hover:bg-accent"
                >
                  Reset pw
                </button>
              </div>,
            ])}
          />
        )}
      </Card>
      <p className="mt-3 text-xs text-muted-foreground">
        Acting as {me?.email}. Role and branch changes are recorded in the audit trail.
      </p>

      {showForm && (
        <Modal title="New user" onClose={() => setShowForm(false)}>
          <UserForm
            branches={branches}
            roles={roles}
            onSubmit={async (v) => {
              try {
                const res = await createUser({ data: v });
                if (res.ok) {
                  toast.success("User created");
                  setShowForm(false);
                  const list = await getUsers();
                  setUsers(list);
                } else toast.error(res.error ?? "Could not create user");
              } catch {
                toast.error("Could not create user");
              }
            }}
          />
        </Modal>
      )}

      {resetTarget && (
        <Modal title={`Reset password — ${resetTarget.email}`} onClose={() => setResetTarget(null)}>
          <ResetForm
            onSubmit={async (pw) => {
              try {
                const res = await resetPw({ data: { id: resetTarget.id, password: pw } });
                if (res.ok) {
                  toast.success("Password reset");
                  setResetTarget(null);
                } else toast.error(res.error ?? "Failed");
              } catch {
                toast.error("Failed");
              }
            }}
          />
        </Modal>
      )}
    </div>
  );
}

function Modal({
  title,
  onClose,
  children,
}: {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-md rounded-xl border border-border bg-card p-6 shadow-xl">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-display text-lg font-semibold text-foreground">{title}</h2>
          <button
            onClick={onClose}
            className="rounded-md p-1 text-muted-foreground hover:bg-accent"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

function UserForm({
  branches,
  roles,
  onSubmit,
}: {
  branches: { id: string; name: string }[];
  roles: string[];
  onSubmit: (v: {
    name: string;
    email: string;
    password: string;
    role: string;
    branchId: string;
    title?: string;
    phone?: string;
  }) => void;
}) {
  const [v, setV] = useState({
    name: "",
    email: "",
    password: "",
    role: roles[0] ?? "",
    branchId: branches[0]?.id ?? "",
    title: "",
    phone: "",
  });
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (v.password.length < 8) {
          toast.error("Password must be at least 8 characters");
          return;
        }
        onSubmit(v);
      }}
      className="space-y-3"
    >
      {(
        [
          ["Full name", "name"],
          ["Email", "email"],
          ["Title", "title"],
          ["Phone", "phone"],
        ] as const
      ).map(([label, key]) => (
        <label key={key} className="block">
          <span className="mb-1 block text-xs font-semibold text-foreground">{label}</span>
          <input
            type={key === "email" ? "email" : "text"}
            value={v[key]}
            onChange={(e) => setV({ ...v, [key]: e.target.value })}
            required={key === "name" || key === "email"}
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
          />
        </label>
      ))}
      <label className="block">
        <span className="mb-1 block text-xs font-semibold text-foreground">Password (min 8)</span>
        <input
          type="password"
          value={v.password}
          onChange={(e) => setV({ ...v, password: e.target.value })}
          required
          className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
        />
      </label>
      <div className="grid grid-cols-2 gap-3">
        <label className="block">
          <span className="mb-1 block text-xs font-semibold text-foreground">Role</span>
          <select
            value={v.role}
            onChange={(e) => setV({ ...v, role: e.target.value })}
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
          >
            {roles.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
        </label>
        <label className="block">
          <span className="mb-1 block text-xs font-semibold text-foreground">Branch</span>
          <select
            value={v.branchId}
            onChange={(e) => setV({ ...v, branchId: e.target.value })}
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
          >
            {branches.map((b) => (
              <option key={b.id} value={b.id}>
                {b.name}
              </option>
            ))}
          </select>
        </label>
      </div>
      <button type="submit" className="btn-primary w-full">
        Create user
      </button>
      <style>{`.btn-primary{display:inline-flex;height:2.5rem;align-items:center;justify-content:center;border-radius:0.375rem;background:var(--color-primary);font-size:0.875rem;font-weight:600;color:var(--color-primary-foreground)}`}</style>
    </form>
  );
}

function ResetForm({ onSubmit }: { onSubmit: (pw: string) => void }) {
  const [pw, setPw] = useState("");
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (pw.length < 8) {
          toast.error("Password must be at least 8 characters");
          return;
        }
        onSubmit(pw);
      }}
      className="space-y-3"
    >
      <label className="block">
        <span className="mb-1 block text-xs font-semibold text-foreground">New password</span>
        <input
          type="password"
          value={pw}
          onChange={(e) => setPw(e.target.value)}
          required
          className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
        />
      </label>
      <button
        type="submit"
        className="inline-flex h-10 w-full items-center justify-center rounded-md bg-primary text-sm font-semibold text-primary-foreground"
      >
        Reset password
      </button>
    </form>
  );
}
