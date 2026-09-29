import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { listRecordsFn } from "@/lib/records.functions";
import type { RecordDTO } from "@/lib/records-schema";
import { AppPageHeader, Card, EmptyState } from "@/components/app-primitives";
import { StatusBadge } from "@/components/status-badges";
import { complaints, appeals } from "@/lib/records-collections-ext";
import { Loader2 } from "lucide-react";

export const Route = createFileRoute("/app/complaints/analytics")({
  head: () => ({ meta: [{ title: "Complaint & Appeal Analytics — DigiCB" }] }),
  component: Page,
});

function Page() {
  const list = useServerFn(listRecordsFn);
  const [comps, setComps] = useState<RecordDTO[]>([]);
  const [apls, setApls] = useState<RecordDTO[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      list({ data: { collection: "complaints", archived: false } }),
      list({ data: { collection: "appeals", archived: false } }),
    ])
      .then(([c, a]) => {
        setComps(c.records);
        setApls(a.records);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [list]);

  if (loading)
    return (
      <p className="flex items-center gap-2 text-sm text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin" /> Loading…
      </p>
    );

  const compByStatus = groupBy(comps, (r) => r.status);
  const compByCategory = groupBy(comps, (r) => String(r.data.category ?? "unknown"));
  const openComps = comps.filter((c) => !["closed"].includes(c.status)).length;
  const closedComps = comps.filter((c) => c.status === "closed").length;
  const openApls = apls.filter((a) => !["closed"].includes(a.status)).length;

  return (
    <div>
      <AppPageHeader
        title="Complaint & Appeal Analytics"
        description="Trends and breakdowns across complaints and appeals."
      />
      <div className="mb-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Card className="p-3">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
            Total Complaints
          </p>
          <p className="font-display text-xl font-bold text-foreground">{comps.length}</p>
        </Card>
        <Card className="p-3">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
            Open Complaints
          </p>
          <p className="font-display text-xl font-bold text-foreground">{openComps}</p>
        </Card>
        <Card className="p-3">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
            Closed Complaints
          </p>
          <p className="font-display text-xl font-bold text-foreground">{closedComps}</p>
        </Card>
        <Card className="p-3">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
            Open Appeals
          </p>
          <p className="font-display text-xl font-bold text-foreground">{openApls}</p>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="p-4">
          <p className="mb-3 font-display text-sm font-semibold text-foreground">
            Complaints by Status
          </p>
          {comps.length === 0 ? (
            <EmptyState title="No complaints" body="" />
          ) : (
            <div className="space-y-2">
              {Object.entries(compByStatus).map(([status, items]) => (
                <div key={status} className="flex items-center justify-between text-sm">
                  <StatusBadge
                    status={status}
                    label={complaints.statuses.find((s) => s.value === status)?.label}
                  />
                  <span className="font-mono font-semibold text-foreground">{items.length}</span>
                </div>
              ))}
            </div>
          )}
        </Card>
        <Card className="p-4">
          <p className="mb-3 font-display text-sm font-semibold text-foreground">
            Complaints by Category
          </p>
          {comps.length === 0 ? (
            <EmptyState title="No complaints" body="" />
          ) : (
            <div className="space-y-2">
              {Object.entries(compByCategory).map(([cat, items]) => (
                <div key={cat} className="flex items-center justify-between text-sm">
                  <span className="text-foreground capitalize">{cat}</span>
                  <span className="font-mono font-semibold text-foreground">{items.length}</span>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>

      <Card className="mt-4 p-4">
        <p className="mb-3 font-display text-sm font-semibold text-foreground">Appeals by Status</p>
        {apls.length === 0 ? (
          <EmptyState title="No appeals" body="" />
        ) : (
          <div className="space-y-2">
            {Object.entries(groupBy(apls, (r) => r.status)).map(([status, items]) => (
              <div key={status} className="flex items-center justify-between text-sm">
                <StatusBadge
                  status={status}
                  label={appeals.statuses.find((s) => s.value === status)?.label}
                />
                <span className="font-mono font-semibold text-foreground">{items.length}</span>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}

function groupBy<T>(arr: T[], fn: (t: T) => string): Record<string, T[]> {
  const out: Record<string, T[]> = {};
  for (const item of arr) {
    const k = fn(item);
    (out[k] ??= []).push(item);
  }
  return out;
}
