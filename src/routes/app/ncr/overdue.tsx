import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { listRecordsFn } from "@/lib/records.functions";
import type { RecordDTO } from "@/lib/records-schema";
import { AppPageHeader, Card, EmptyState } from "@/components/app-primitives";
import { StatusBadge } from "@/components/status-badges";
import { Loader2 } from "lucide-react";

export const Route = createFileRoute("/app/ncr/overdue")({
  head: () => ({ meta: [{ title: "Overdue NCRs — DigiCB" }] }),
  component: Page,
});

function Page() {
  const list = useServerFn(listRecordsFn);
  const [records, setRecords] = useState<RecordDTO[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    list({ data: { collection: "ncrs", archived: false } })
      .then((r) => setRecords(r.records))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [list]);
  if (loading)
    return (
      <p className="flex items-center gap-2 text-sm text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin" /> Loading…
      </p>
    );
  const now = Date.now();
  const overdue = records.filter((r) => {
    const td = r.data.targetDate as string | undefined;
    return td && new Date(td).getTime() < now && r.status !== "closed";
  });
  return (
    <div>
      <AppPageHeader
        title="Overdue NCRs"
        description="Nonconformities past their target closure date."
      />
      {overdue.length === 0 ? (
        <EmptyState title="No overdue NCRs" body="All nonconformities are on track." />
      ) : (
        <Card>
          <div className="space-y-2">
            {overdue.map((r) => (
              <div
                key={r.id}
                className="flex items-center justify-between rounded-md border border-border bg-destructive/5 px-3 py-2 text-sm"
              >
                <div>
                  <p className="font-medium text-foreground">
                    {r.number} — {String(r.data.clientName ?? "—")}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Target: {String(r.data.targetDate)} · {String(r.data.classification ?? "—")}
                  </p>
                </div>
                <StatusBadge status={r.status} />
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
