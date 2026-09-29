import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Link } from "@tanstack/react-router";
import { listRecordsFn } from "@/lib/records.functions";
import type { RecordDTO } from "@/lib/records-schema";
import { AppPageHeader, Card, EmptyState, DataTable, Pill } from "@/components/app-primitives";
import { Loader2 } from "lucide-react";

export const Route = createFileRoute("/app/kpis/")({
  head: () => ({ meta: [{ title: "KPI Dashboard — DigiCB" }] }),
  component: Page,
});

function Page() {
  const list = useServerFn(listRecordsFn);
  const [items, setItems] = useState<RecordDTO[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let a = true;
    (async () => {
      try {
        const r = await list({ data: { collection: "kpis", archived: false } });
        if (a) setItems(r.records);
      } catch {
        /* */
      } finally {
        if (a) setLoading(false);
      }
    })();
    return () => {
      a = false;
    };
  }, [list]);

  const avgScore =
    items.length > 0
      ? Math.round(items.reduce((s, r) => s + (Number(r.data.score) || 0), 0) / items.length)
      : 0;
  const byScope = items.reduce<Record<string, number>>((acc, r) => {
    const k = String(r.data.ownerScope ?? "unknown");
    acc[k] = (acc[k] ?? 0) + 1;
    return acc;
  }, {});

  return (
    <div>
      <AppPageHeader
        title="KPI Dashboard"
        description="Configurable, evidence-based KPIs for employees, auditors, departments, processes, branches and schemes."
      >
        <Link
          to="/app/kpis/employees"
          className="inline-flex h-9 items-center rounded-md bg-primary px-3 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
        >
          + View KPIs
        </Link>
      </AppPageHeader>
      {loading ? (
        <Card className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" /> Loading KPIs…
        </Card>
      ) : items.length === 0 ? (
        <EmptyState title="No KPIs" body="KPI records will appear here once created." />
      ) : (
        <>
          <div className="mb-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
            <Card className="p-3">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                Total KPIs
              </p>
              <p className="font-display text-xl font-bold text-foreground">{items.length}</p>
            </Card>
            <Card className="p-3">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                Avg Score
              </p>
              <p className="font-display text-xl font-bold text-foreground">{avgScore}%</p>
            </Card>
            <Card className="p-3">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                Due Review
              </p>
              <p className="font-display text-xl font-bold text-warning">
                {items.filter((r) => r.status === "review").length}
              </p>
            </Card>
            <Card className="p-3">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                Corrective Action
              </p>
              <p className="font-display text-xl font-bold text-destructive">
                {items.filter((r) => r.status === "action").length}
              </p>
            </Card>
          </div>
          <DataTable
            headers={["KPI", "Scope", "Target", "Actual", "Score", "Trend", "Owner"]}
            rows={items
              .slice(0, 15)
              .map((r) => [
                <span className="font-medium text-foreground">{String(r.data.title ?? "")}</span>,
                <Pill tone="info">{String(r.data.ownerScope ?? "—")}</Pill>,
                <span className="text-muted-foreground">{String(r.data.target ?? "—")}</span>,
                <span className="text-muted-foreground">{String(r.data.actual ?? "—")}</span>,
                <span className="font-mono font-semibold text-foreground">
                  {String(r.data.score ?? "—")}%
                </span>,
                <Pill
                  tone={
                    r.data.trend === "up" ? "success" : r.data.trend === "down" ? "danger" : "muted"
                  }
                >
                  {String(r.data.trend ?? "—")}
                </Pill>,
                <span className="text-muted-foreground">{String(r.data.owner ?? "—")}</span>,
              ])}
          />
          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            {Object.entries(byScope).map(([scope, count]) => (
              <Card key={scope} className="p-3">
                <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground capitalize">
                  {scope}
                </p>
                <p className="font-display text-lg font-bold text-foreground">{count} KPIs</p>
              </Card>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
