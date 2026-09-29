import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Link } from "@tanstack/react-router";
import { listReassessmentRemindersFn } from "@/lib/conformity.functions";
import type { ReassessmentReminder } from "@/lib/conformity-schema";
import { AppPageHeader, Card, EmptyState, SectionTitle } from "@/components/app-primitives";
import { AlertTriangle, Clock, FileWarning, RefreshCw } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/app/conformity/reminders")({
  head: () => ({
    meta: [
      { title: "Reassessment Reminders — DigiCB" },
      {
        name: "description",
        content:
          "Automated reminders for expiring evidence, transitional ISO standards and upcoming clause reassessments.",
      },
    ],
  }),
  component: Page,
});

const KIND_LABEL: Record<ReassessmentReminder["kind"], string> = {
  evidence_expiry: "Evidence Expiry",
  standard_transition: "Standard Transition",
  clause_reassessment: "Clause Reassessment",
};

function severityClasses(sev: ReassessmentReminder["severity"]): string {
  switch (sev) {
    case "critical":
      return "border-destructive/30 bg-destructive/5";
    case "warning":
      return "border-warning/30 bg-warning/5";
    default:
      return "border-info/30 bg-info/5";
  }
}

function severityText(sev: ReassessmentReminder["severity"]): string {
  return sev === "critical" ? "text-destructive" : sev === "warning" ? "text-warning" : "text-info";
}

function Page() {
  const getReminders = useServerFn(listReassessmentRemindersFn);
  const [items, setItems] = useState<ReassessmentReminder[]>([]);
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    getReminders()
      .then((r) => setItems(r))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [getReminders]);

  const overdue = items.filter((r) => (r.daysLeft ?? 0) < 0);
  const dueSoon = items.filter((r) => (r.daysLeft ?? 0) >= 0 && (r.daysLeft ?? 0) <= 30);
  const upcoming = items.filter((r) => (r.daysLeft ?? 0) > 30);

  return (
    <div>
      <AppPageHeader
        title="Reassessment Reminders"
        description="Automated reminders for expiring evidence, transitional ISO standards and upcoming clause reassessments. Computed live from current records."
      >
        <button
          onClick={() => {
            load();
            toast.success("Reminders refreshed");
          }}
          className="inline-flex h-9 items-center gap-1.5 rounded-md border border-input bg-background px-3 text-sm font-medium text-foreground hover:bg-accent"
        >
          <RefreshCw className="h-4 w-4" /> Refresh
        </button>
      </AppPageHeader>

      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <Card className="p-4">
          <div className="flex items-center gap-2 text-destructive">
            <AlertTriangle className="h-5 w-5" />
            <span className="text-sm font-medium">Overdue</span>
          </div>
          <p className="mt-2 font-display text-3xl font-bold text-foreground">{overdue.length}</p>
          <p className="text-xs text-muted-foreground">Past due date — action required now</p>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-2 text-warning">
            <Clock className="h-5 w-5" />
            <span className="text-sm font-medium">Due within 30 days</span>
          </div>
          <p className="mt-2 font-display text-3xl font-bold text-foreground">{dueSoon.length}</p>
          <p className="text-xs text-muted-foreground">Schedule reassessment before expiry</p>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-2 text-info">
            <FileWarning className="h-5 w-5" />
            <span className="text-sm font-medium">Upcoming (90 days)</span>
          </div>
          <p className="mt-2 font-display text-3xl font-bold text-foreground">{upcoming.length}</p>
          <p className="text-xs text-muted-foreground">Plan ahead to maintain compliance</p>
        </Card>
      </div>

      {loading ? (
        <Card>
          <p className="py-6 text-center text-sm text-muted-foreground">Loading reminders…</p>
        </Card>
      ) : items.length === 0 ? (
        <Card>
          <EmptyState
            title="No reassessment reminders"
            body="No evidence is expiring, no standards are in transition, and no clause reassessments are due within 90 days."
          />
        </Card>
      ) : (
        <Card>
          <SectionTitle>Active Reminders</SectionTitle>
          <p className="mt-1 text-xs text-muted-foreground">
            Reminders are also pushed to your notification feed. Resolving the underlying evidence,
            transition or assessment automatically clears the reminder.
          </p>
          <div className="mt-4 space-y-3">
            {items.map((r) => (
              <div
                key={r.id}
                className={`rounded-lg border px-4 py-3 ${severityClasses(r.severity)}`}
              >
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-foreground">{r.title}</span>
                      <span className="rounded-full border border-border px-2 py-0.5 text-[10px] uppercase tracking-wide text-muted-foreground">
                        {KIND_LABEL[r.kind]}
                      </span>
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground">{r.detail}</p>
                    <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
                      <span>Owner: {r.owner}</span>
                      {r.dueDate && <span>Due: {r.dueDate}</span>}
                      {r.relatedClauses.length > 0 && (
                        <span>{r.relatedClauses.length} linked clause(s)</span>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <span className={`text-sm font-bold ${severityText(r.severity)}`}>
                      {r.daysLeft === null
                        ? "—"
                        : r.daysLeft < 0
                          ? `${Math.abs(r.daysLeft)}d overdue`
                          : `${r.daysLeft}d left`}
                    </span>
                    <Link to={r.link} className="text-xs font-medium text-primary hover:underline">
                      View →
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      <p className="mt-4 rounded-md bg-muted/50 px-3 py-2 text-[11px] text-muted-foreground">
        System-generated — subject to authorized review. Reminders are calculated live from evidence
        expiry dates, standard transition deadlines and clause next-assessment dates. No AI feature
        makes a certification decision or closes a nonconformity; an accountable human must approve
        every reassessment.
      </p>
    </div>
  );
}
