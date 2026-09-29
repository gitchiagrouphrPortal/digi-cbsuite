// DigiCB authenticated application shell. Sidebar + topbar + content outlet.
import { useState, useMemo, useEffect } from "react";
import { Link, Outlet, useLocation, useNavigate } from "@tanstack/react-router";
import {
  ShieldCheck,
  Menu,
  X,
  Search,
  Bell,
  Plus,
  ChevronDown,
  ChevronRight,
  Sun,
  Moon,
  LogOut,
  User,
  HelpCircle,
  Settings,
  PanelLeftClose,
  PanelLeft,
  Users,
  FileText,
  KanbanSquare,
  ClipboardCheck,
  AlertTriangle,
  Gavel,
  Award,
  FolderOpen,
  Network,
  IdCard,
  MessageSquareWarning,
  Building2,
  BarChart3,
  Gauge,
  GraduationCap,
  FileBarChart,
  Layers,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/auth-context";
import { useTheme } from "@/hooks/use-theme";
import { NAV_MODULES, type NavModule } from "@/lib/nav-config";
import { roleHas } from "@/lib/digicb-roles";
import { toast } from "sonner";
import { useServerFn } from "@tanstack/react-start";
import { getNotificationsFn, markNotificationsReadFn } from "@/lib/digicb.functions";
import { useFramework, FRAMEWORK_PRESETS } from "@/lib/framework-context";

const ICONS: Record<string, typeof ShieldCheck> = {
  LayoutDashboard: ShieldCheck,
  Users,
  FileText,
  KanbanSquare,
  ClipboardCheck,
  AlertTriangle,
  Gavel,
  Award,
  FolderOpen,
  Network,
  IdCard,
  ShieldCheck,
  MessageSquareWarning,
  Building2,
  BarChart3,
  Gauge,
  GraduationCap,
  FileBarChart,
  Settings,
};

import type { ReactNode } from "react";

export function AppShell({ children }: { children?: ReactNode } = {}) {
  const { user, loading, signOut } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const { theme, toggle } = useTheme();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [expanded, setExpanded] = useState<Record<string, boolean>>({ dashboard: true });
  const [query, setQuery] = useState("");
  const [profileOpen, setProfileOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const [fwOpen, setFwOpen] = useState(false);
  const { framework, setFramework } = useFramework();

  const getNotifications = useServerFn(getNotificationsFn);
  const markRead = useServerFn(markNotificationsReadFn);
  const [notifications, setNotifications] = useState<
    { id: string; title: string; body: string; read: boolean; link?: string }[]
  >([]);
  const [notifLoading, setNotifLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    let active = true;
    getNotifications()
      .then((n) => active && setNotifications(n))
      .catch(() => {})
      .finally(() => active && setNotifLoading(false));
    return () => {
      active = false;
    };
  }, [user, getNotifications, location.pathname]);

  // Persist sidebar collapse preference
  useEffect(() => {
    try {
      const stored = localStorage.getItem("digicb-sidebar");
      if (stored) setCollapsed(stored === "collapsed");
    } catch {
      /* ignore */
    }
  }, []);
  useEffect(() => {
    try {
      localStorage.setItem("digicb-sidebar", collapsed ? "collapsed" : "expanded");
    } catch {
      /* ignore */
    }
  }, [collapsed]);

  const perms = user?.permissions ?? [];
  const visibleModules = useMemo(() => NAV_MODULES.filter((m) => roleHas(m.key, perms)), [perms]);

  const filteredModules = useMemo(() => {
    if (!query.trim()) return visibleModules;
    const q = query.toLowerCase();
    return visibleModules
      .map((m) => ({
        ...m,
        children: m.children.filter(
          (c) => c.label.toLowerCase().includes(q) || m.label.toLowerCase().includes(q),
        ),
      }))
      .filter((m) => m.children.length > 0);
  }, [visibleModules, query]);

  const breadcrumb = useMemo(() => {
    const segs = location.pathname.split("/").filter(Boolean);
    return segs.slice(0, 3);
  }, [location.pathname]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <div className="h-9 w-9 animate-pulse rounded-lg bg-primary" />
          <p className="text-sm text-muted-foreground">Loading DigiCB…</p>
        </div>
      </div>
    );
  }
  if (!user) return null;

  const unread = notifications.filter((n) => !n.read).length;

  const handleSignOut = async () => {
    await signOut();
    toast.success("Signed out");
    navigate({ to: "/login" });
  };

  const openNotifs = async () => {
    setNotifOpen((v) => !v);
    if (notifications.some((n) => !n.read)) {
      try {
        const updated = await markRead({ data: {} });
        setNotifications(updated);
      } catch {
        /* ignore */
      }
    }
  };

  return (
    <div className="flex min-h-screen bg-background">
      {/* Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex flex-col border-r border-border bg-sidebar text-sidebar-foreground transition-all duration-200 lg:static",
          collapsed ? "w-16" : "w-72",
          mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
        )}
      >
        <div className="flex h-16 items-center gap-2.5 border-b border-sidebar-border px-4">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <ShieldCheck className="h-5 w-5" />
          </div>
          {!collapsed && (
            <div className="flex flex-col leading-none">
              <span className="font-display text-base font-bold tracking-tight text-sidebar-foreground">
                DigiCB
              </span>
              <span className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground">
                Certification Body OS
              </span>
            </div>
          )}
          <button
            className="ml-auto hidden rounded-md p-1.5 text-muted-foreground hover:bg-sidebar-accent lg:block"
            onClick={() => setCollapsed((c) => !c)}
            aria-label="Toggle sidebar"
          >
            {collapsed ? <PanelLeft className="h-4 w-4" /> : <PanelLeftClose className="h-4 w-4" />}
          </button>
        </div>

        {!collapsed && (
          <div className="px-3 py-3">
            <div className="relative">
              <Search className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search modules…"
                className="w-full rounded-md border border-input bg-background py-1.5 pl-8 pr-2 text-sm text-foreground outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
          </div>
        )}

        <nav className="flex-1 overflow-y-auto px-2 pb-4">
          {filteredModules.map((m) => (
            <NavGroup
              key={m.key}
              module={m}
              collapsed={collapsed}
              expanded={!!expanded[m.key]}
              onToggle={() => setExpanded((e) => ({ ...e, [m.key]: !e[m.key] }))}
              onNavigate={() => setMobileOpen(false)}
              currentPath={location.pathname}
            />
          ))}
          {filteredModules.length === 0 && !collapsed && (
            <p className="px-3 py-4 text-center text-xs text-muted-foreground">
              No modules match your search.
            </p>
          )}
        </nav>

        <div className="border-t border-sidebar-border p-3">
          <Link
            to="/app/admin/status"
            className="flex items-center gap-2 rounded-md px-2 py-1.5 text-xs text-muted-foreground hover:bg-sidebar-accent"
          >
            <span className="h-2 w-2 rounded-full bg-success" /> System operational
          </Link>
        </div>
      </aside>

      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Main */}
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-border bg-card/80 px-4 backdrop-blur-xl sm:px-6">
          <button
            className="rounded-md p-2 text-foreground hover:bg-accent lg:hidden"
            onClick={() => setMobileOpen((v) => !v)}
            aria-label="Open menu"
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>

          {/* Breadcrumb */}
          <nav className="hidden items-center gap-1.5 text-sm text-muted-foreground sm:flex">
            <Link to="/app/dashboard" className="hover:text-foreground">
              DigiCB
            </Link>
            {breadcrumb.map((s, i) => (
              <span key={s} className="flex items-center gap-1.5">
                <ChevronRight className="h-3.5 w-3.5" />
                <span className={cn(i === breadcrumb.length - 1 && "font-medium text-foreground")}>
                  {s === "app"
                    ? "Workspace"
                    : s.replace(/-/g, " ").replace(/^\w/, (c) => c.toUpperCase())}
                </span>
              </span>
            ))}
          </nav>

          {/* Accreditation framework quick-switch */}
          <div className="relative ml-auto md:ml-2">
            <button
              onClick={() => setFwOpen((v) => !v)}
              className="inline-flex h-9 items-center gap-1.5 rounded-md border border-input bg-background px-3 text-sm font-medium text-foreground hover:bg-accent"
              title="Switch accreditation workspace"
            >
              <Layers className="h-4 w-4 text-primary" />
              <span className="hidden sm:inline">
                {FRAMEWORK_PRESETS.find((f) => f.value === framework)?.label ?? "All Frameworks"}
              </span>
              <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
            </button>
            {fwOpen && (
              <div className="absolute right-0 top-11 z-40 w-60 rounded-md border border-border bg-popover p-1 shadow-lg">
                <p className="px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                  Accreditation workspace
                </p>
                {FRAMEWORK_PRESETS.map((f) => (
                  <button
                    key={f.value}
                    onClick={() => {
                      setFramework(f.value);
                      setFwOpen(false);
                      toast.success(`Workspace: ${f.label}`);
                    }}
                    className={cn(
                      "flex w-full items-center gap-2 rounded px-3 py-2 text-left text-sm hover:bg-accent",
                      framework === f.value ? "font-semibold text-primary" : "text-foreground",
                    )}
                  >
                    <span className="font-mono text-[10px] text-muted-foreground">{f.short}</span>
                    {f.label}
                  </button>
                ))}
                <p className="mt-1 border-t border-border px-3 py-1.5 text-[10px] text-muted-foreground">
                  Filters Kanban and framework-scoped views.
                </p>
              </div>
            )}
          </div>

          {/* Global search */}
          <div className="relative hidden md:block">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              placeholder="Global search (records, docs, clients…)"
              className="w-72 rounded-md border border-input bg-background py-1.5 pl-9 pr-3 text-sm outline-none focus:ring-2 focus:ring-ring"
            />
          </div>

          {/* Quick create */}
          <div className="relative ml-auto md:ml-0">
            <button
              onClick={() => setCreateOpen((v) => !v)}
              className="inline-flex h-9 items-center gap-1.5 rounded-md bg-primary px-3 text-sm font-medium text-primary-foreground hover:bg-primary/90"
            >
              <Plus className="h-4 w-4" /> <span className="hidden sm:inline">Create</span>
              <ChevronDown className="h-3.5 w-3.5" />
            </button>
            {createOpen && (
              <div className="absolute right-0 top-11 z-40 w-56 rounded-md border border-border bg-popover p-1 shadow-lg">
                {[
                  { l: "New Application", to: "/app/applications/new", p: "applications" },
                  { l: "New Client", to: "/app/crm/clients", p: "crm" },
                  { l: "New Audit", to: "/app/audits/scheduling", p: "audits" },
                  { l: "New NCR", to: "/app/ncr", p: "ncr" },
                  { l: "New Document", to: "/app/documents", p: "documents" },
                  { l: "New Complaint", to: "/app/complaints/new", p: "complaints" },
                  { l: "New User", to: "/app/admin/users", p: "admin" },
                ]
                  .filter((i) => roleHas(i.p, perms))
                  .map((i) => (
                    <Link
                      key={i.l}
                      to={i.to}
                      onClick={() => setCreateOpen(false)}
                      className="block rounded px-3 py-2 text-sm text-foreground hover:bg-accent"
                    >
                      {i.l}
                    </Link>
                  ))}
              </div>
            )}
          </div>

          {/* Notifications */}
          <div className="relative">
            <button
              onClick={openNotifs}
              className="relative rounded-md p-2 text-foreground hover:bg-accent"
              aria-label="Notifications"
            >
              <Bell className="h-5 w-5" />
              {unread > 0 && (
                <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-bold text-destructive-foreground">
                  {unread}
                </span>
              )}
            </button>
            {notifOpen && (
              <div className="absolute right-0 top-11 z-40 w-80 rounded-md border border-border bg-popover shadow-lg">
                <div className="border-b border-border px-4 py-2.5 text-sm font-semibold text-foreground">
                  Notifications
                </div>
                <div className="max-h-80 overflow-y-auto">
                  {notifLoading ? (
                    <p className="px-4 py-6 text-center text-sm text-muted-foreground">Loading…</p>
                  ) : notifications.length === 0 ? (
                    <p className="px-4 py-6 text-center text-sm text-muted-foreground">
                      No notifications
                    </p>
                  ) : (
                    notifications.map((n) => (
                      <Link
                        key={n.id}
                        to={n.link ? `/app/${n.link}` : "/app/notifications"}
                        onClick={() => setNotifOpen(false)}
                        className={cn(
                          "block border-b border-border px-4 py-2.5 hover:bg-accent",
                          !n.read && "bg-primary/5",
                        )}
                      >
                        <p className="text-sm font-medium text-foreground">{n.title}</p>
                        <p className="text-xs text-muted-foreground">{n.body}</p>
                      </Link>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Theme */}
          <button
            onClick={toggle}
            className="rounded-md p-2 text-foreground hover:bg-accent"
            aria-label="Toggle theme"
          >
            {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </button>

          {/* User menu */}
          <div className="relative">
            <button
              onClick={() => setProfileOpen((v) => !v)}
              className="flex items-center gap-2 rounded-md p-1 hover:bg-accent"
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                {user.name
                  .split(" ")
                  .map((p) => p[0])
                  .slice(0, 2)
                  .join("")}
              </div>
              <div className="hidden text-left sm:block">
                <p className="text-xs font-medium leading-tight text-foreground">{user.name}</p>
                <p className="text-[10px] leading-tight text-muted-foreground">{user.role}</p>
              </div>
              <ChevronDown className="hidden h-3.5 w-3.5 text-muted-foreground sm:block" />
            </button>
            {profileOpen && (
              <div className="absolute right-0 top-11 z-40 w-56 rounded-md border border-border bg-popover p-1 shadow-lg">
                <div className="border-b border-border px-3 py-2">
                  <p className="text-sm font-medium text-foreground">{user.name}</p>
                  <p className="text-xs text-muted-foreground">{user.email}</p>
                </div>
                <Link
                  to="/app/profile"
                  onClick={() => setProfileOpen(false)}
                  className="flex items-center gap-2 rounded px-3 py-2 text-sm text-foreground hover:bg-accent"
                >
                  <User className="h-4 w-4" /> Profile & Security
                </Link>
                {roleHas("admin", perms) && (
                  <Link
                    to="/app/admin/status"
                    onClick={() => setProfileOpen(false)}
                    className="flex items-center gap-2 rounded px-3 py-2 text-sm text-foreground hover:bg-accent"
                  >
                    <Settings className="h-4 w-4" /> Administration
                  </Link>
                )}
                <a
                  href="/login-help"
                  onClick={(e) => {
                    e.preventDefault();
                    toast.info("Help center coming in a later phase");
                  }}
                  className="flex items-center gap-2 rounded px-3 py-2 text-sm text-foreground hover:bg-accent"
                >
                  <HelpCircle className="h-4 w-4" /> Help
                </a>
                <button
                  onClick={handleSignOut}
                  className="flex w-full items-center gap-2 rounded px-3 py-2 text-sm text-destructive hover:bg-destructive/10"
                >
                  <LogOut className="h-4 w-4" /> Sign out
                </button>
              </div>
            )}
          </div>
        </header>

        <main className="flex-1 overflow-x-hidden p-4 sm:p-6 lg:p-8">{children ?? <Outlet />}</main>
      </div>
    </div>
  );
}

function NavGroup({
  module,
  collapsed,
  expanded,
  onToggle,
  onNavigate,
  currentPath,
}: {
  module: NavModule;
  collapsed: boolean;
  expanded: boolean;
  onToggle: () => void;
  onNavigate: () => void;
  currentPath: string;
}) {
  const Icon = ICONS[module.icon] ?? ShieldCheck;
  const active = module.children.some(
    (c) => currentPath === c.to || currentPath.startsWith(c.to + "/"),
  );
  return (
    <div className="mb-0.5">
      <button
        onClick={onToggle}
        className={cn(
          "flex w-full items-center gap-2.5 rounded-md px-2.5 py-2 text-sm font-medium transition-colors",
          active
            ? "bg-sidebar-accent text-sidebar-accent-foreground"
            : "text-sidebar-foreground hover:bg-sidebar-accent/60",
          collapsed && "justify-center",
        )}
        title={collapsed ? module.label : undefined}
      >
        <Icon className="h-4 w-4 shrink-0" />
        {!collapsed && <span className="flex-1 text-left">{module.label}</span>}
        {!collapsed &&
          (expanded ? (
            <ChevronDown className="h-3.5 w-3.5" />
          ) : (
            <ChevronRight className="h-3.5 w-3.5" />
          ))}
      </button>
      {expanded && !collapsed && (
        <div className="ml-7 mt-0.5 border-l border-sidebar-border pl-2">
          {module.children.map((c) => {
            const isCurrent = currentPath === c.to;
            return (
              <Link
                key={c.to}
                to={c.to}
                onClick={onNavigate}
                className={cn(
                  "block rounded px-2.5 py-1.5 text-[13px] transition-colors",
                  isCurrent
                    ? "bg-primary/10 font-medium text-primary"
                    : "text-muted-foreground hover:bg-sidebar-accent/60 hover:text-foreground",
                )}
              >
                {c.label}
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
