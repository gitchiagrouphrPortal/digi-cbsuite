import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  ClipboardList,
  AlertTriangle,
  FileCheck,
  Bell,
  ShieldAlert,
  Award,
  BadgeCheck,
  MessageSquareWarning,
  CalendarClock,
  ArrowRight,
  Activity,
} from "lucide-react";
import { useServerFn } from "@tanstack/react-start";
import { getDashboardFn } from "@/lib/digicb.functions";
import { useAuth } from "@/lib/auth-context";
import { AppPageHeader, Card, SectionTitle, Pill } from "@/components/app-primitives";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/app/dashboard")({
  head: () => ({
    meta: [
      { title: "Executive Dashboard — DigiCB" },
      {
        name: "description",
        content:
          "Role-specific DigiCB dashboard with tasks, approvals, NCRs and compliance calendar.",
      },
    ],
  }),
  component: DashboardPage,
});

const ICONS: Record<string, typeof ClipboardList> = {
  "My open tasks": ClipboardList,
  "Overdue tasks": AlertTriangle,
  "Pending approvals": FileCheck,
  "Unread notifications": Bell,
  "Open NCRs": ShieldAlert,
  "Certificates expiring": Award,
  "Auth. expiring": BadgeCheck,
  "Complaints open": MessageSquareWarning,
};
const TONE: Record<string, "info" | "warning" | "danger" | "success"> = {
  info: "info",
  warning: "warning",
  danger: "danger",
  success: "success",
};

function DashboardPage() {
  const { user } = useAuth();
  const getDashboard = useServerFn(getDashboardFn);
  const [data, setData] = useState<Awaited<ReturnType<typeof getDashboard>> | null>(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  useEffect(() => {
    let active = true;
    getDashboard()
      .then((d) => active && setData(d))
      .catch(() => active && setErr("Unable to load dashboard."))
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, [getDashboard]);

  if (loading) return <p className="text-sm text-muted-foreground">Loading dashboard…</p>;
  if (err || !data) return <p className="text-sm text-destructive">{err}</p>;

  return (
    <div>
      <AppPageHeader
        title={`Welcome, ${user?.name?.split(" ")[0] ?? ""}`}
        description="Your compliance snapshot across certification, audits, NCRs and accreditation frameworks."
      >
        <Link
          to="/app/approvals"
          className="inline-flex h-9 items-center gap-1.5 rounded-md bg-primary px-4 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
        >
          View approvals <ArrowRight className="h-4 w-4" />
        </Link>
      </AppPageHeader>

      {/* Stats grid */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {data.stats.map((s) => {
          const Icon = ICONS[s.label] ?? ClipboardList;
          return (
            <Card key={s.label} className="flex items-start justify-between">
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  {s.label}
                </p>
                <p
                  className={cn(
                    "mt-1 font-display text-3xl font-bold",
                    s.value > 0 && s.tone === "danger" && "text-destructive",
                    s.value > 0 && s.tone === "warning" && "text-warning",
                  )}
                >
                  {s.value}
                </p>
              </div>
              <div
                className={cn(
                  "flex h-9 w-9 items-center justify-center rounded-lg",
                  s.tone === "danger"
                    ? "bg-destructive/15 text-destructive"
                    : s.tone === "warning"
                      ? "bg-warning/15 text-warning"
                      : "bg-info/15 text-info",
                )}
              >
                <Icon className="h-4 w-4" />
              </div>
            </Card>
          );
        })}
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        {/* Recent activity */}
        <Card className="lg:col-span-2">
          <div className="flex items-center gap-2">
            <Activity className="h-4 w-4 text-primary" />
            <SectionTitle>Recent activity</SectionTitle>
          </div>
          <div className="mt-4 space-y-2">
            {data.recentActivity.map((a) => (
              <div
                key={a.id}
                className="flex items-start gap-3 rounded-lg border border-border bg-muted/30 px-3 py-2.5"
              >
                <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <span className="text-[10px] font-bold">{a.actor[0]?.toUpperCase() ?? "S"}</span>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm text-foreground">
                    <span className="font-medium">{a.actor}</span> ·{" "}
                    <span className="font-mono text-xs text-muted-foreground">{a.action}</span>
                  </p>
                  <p className="text-xs text-muted-foreground">{a.detail}</p>
                </div>
                <span className="shrink-0 text-[11px] text-muted-foreground">
                  {new Date(a.ts).toLocaleTimeString()}
                </span>
              </div>
            ))}
          </div>
        </Card>

        {/* Upcoming */}
        <Card>
          <div className="flex items-center gap-2">
            <CalendarClock className="h-4 w-4 text-primary" />
            <SectionTitle>Upcoming</SectionTitle>
          </div>
          <div className="mt-4 space-y-2">
            {data.upcoming.map((e) => (
              <div
                key={e.id}
                className="flex items-center justify-between rounded-lg border border-border bg-muted/30 px-3 py-2"
              >
                <div>
                  <p className="text-sm font-medium text-foreground">{e.title}</p>
                  <p className="text-xs text-muted-foreground">{e.category}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs font-medium text-foreground">{e.date}</p>
                  <Pill tone="info">{e.status}</Pill>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Quick links */}
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { l: "My tasks", to: "/app/my-tasks", n: data.stats[0].value, tone: "info" as const },
          {
            l: "Approvals",
            to: "/app/approvals",
            n: data.stats[2].value,
            tone: "warning" as const,
          },
          { l: "NCRs", to: "/app/ncr", n: data.stats[4].value, tone: "warning" as const },
          {
            l: "Complaints",
            to: "/app/complaints",
            n: data.stats[7].value,
            tone: "danger" as const,
          },
        ].map((q) => (
          <Link
            key={q.l}
            to={q.to}
            className="group rounded-xl border border-border bg-card p-4 shadow-sm transition hover:border-primary/40"
          >
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-foreground">{q.l}</span>
              <span className="font-display text-xl font-bold text-primary">{q.n}</span>
            </div>
            <span className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-primary">
              Open{" "}
              <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
