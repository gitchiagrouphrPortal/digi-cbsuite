import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { getMyTasksFn } from "@/lib/digicb.functions";
import { AppPageHeader, Card, DataTable, EmptyState, Pill } from "@/components/app-primitives";

export const Route = createFileRoute("/app/my-tasks")({
  head: () => ({ meta: [{ title: "My Tasks — DigiCB" }] }),
  component: MyTasksPage,
});

function MyTasksPage() {
  const getMyTasks = useServerFn(getMyTasksFn);
  const [tasks, setTasks] = useState<Awaited<ReturnType<typeof getMyTasks>> | null>(null);
  const [filter, setFilter] = useState<"all" | "open" | "overdue" | "done">("all");

  useEffect(() => {
    let active = true;
    getMyTasks()
      .then((t) => active && setTasks(t))
      .catch(() => {})
      .finally(() => active && {});
    return () => {
      active = false;
    };
  }, [getMyTasks]);

  const filtered = (tasks ?? []).filter((t) => filter === "all" || t.status === filter);

  return (
    <div>
      <AppPageHeader
        title="My Tasks"
        description="Tasks assigned to you across certification, audits, NCRs and approvals."
      />
      <div className="mb-4 flex gap-1.5">
        {(["all", "open", "overdue", "done"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`rounded-md px-3 py-1.5 text-sm font-medium capitalize ${filter === f ? "bg-primary text-primary-foreground" : "border border-input bg-card text-foreground hover:bg-accent"}`}
          >
            {f}
          </button>
        ))}
      </div>
      <Card>
        {filtered.length === 0 ? (
          <EmptyState
            title="No tasks here"
            body="Tasks assigned to you will appear in this list."
            action={
              <Link
                to="/app/dashboard"
                className="text-sm font-semibold text-primary hover:underline"
              >
                Back to dashboard
              </Link>
            }
          />
        ) : (
          <DataTable
            headers={["Task", "Type", "Priority", "Due", "Status", "Related"]}
            rows={filtered.map((t) => [
              <span className="font-medium text-foreground">{t.title}</span>,
              <span className="text-muted-foreground">{t.type}</span>,
              <Pill
                tone={
                  t.priority === "urgent"
                    ? "danger"
                    : t.priority === "high"
                      ? "warning"
                      : t.priority === "medium"
                        ? "info"
                        : "muted"
                }
              >
                {t.priority}
              </Pill>,
              <span className="text-muted-foreground">{t.due}</span>,
              <Pill
                tone={
                  t.status === "overdue"
                    ? "danger"
                    : t.status === "done"
                      ? "success"
                      : t.status === "in_progress"
                        ? "info"
                        : "muted"
                }
              >
                {t.status}
              </Pill>,
              <span className="font-mono text-xs text-muted-foreground">{t.related ?? "—"}</span>,
            ])}
          />
        )}
      </Card>
    </div>
  );
}
