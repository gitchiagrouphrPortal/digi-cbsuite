import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { listRecordsFn } from "@/lib/records.functions";
import type { RecordDTO } from "@/lib/records-schema";
import { AppPageHeader, Card } from "@/components/app-primitives";
import { Loader2 } from "lucide-react";

export const Route = createFileRoute("/app/ncr/analytics")({
  head: () => ({ meta: [{ title: "NCR Analytics — DigiCB" }] }),
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
  const byClass: Record<string, number> = {};
  const byStatus: Record<string, number> = {};
  records.forEach((r) => {
    byClass[String(r.data.classification ?? "unclassified")] =
      (byClass[String(r.data.classification ?? "unclassified")] ?? 0) + 1;
    byStatus[r.status] = (byStatus[r.status] ?? 0) + 1;
  });
  const closed = byStatus.closed ?? 0;
  const open = records.length - closed;
  return (
    <div>
      <AppPageHeader
        title="NCR Analytics"
        description="Classification, status and aging analysis of nonconformities."
      />
      <div className="grid gap-4 lg:grid-cols-3">
        <Card>
          <p className="text-xs uppercase text-muted-foreground">Total NCRs</p>
          <p className="font-display text-3xl font-bold text-foreground">{records.length}</p>
        </Card>
        <Card>
          <p className="text-xs uppercase text-muted-foreground">Open</p>
          <p className="font-display text-3xl font-bold text-warning">{open}</p>
        </Card>
        <Card>
          <p className="text-xs uppercase text-muted-foreground">Closed</p>
          <p className="font-display text-3xl font-bold text-success">{closed}</p>
        </Card>
      </div>
      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <Card>
          <p className="mb-2 font-semibold text-foreground">By Classification</p>
          {Object.entries(byClass).map(([k, v]) => (
            <div
              key={k}
              className="flex items-center justify-between border-b border-border/50 py-1.5 text-sm"
            >
              <span className="capitalize text-muted-foreground">{k}</span>
              <span className="font-medium text-foreground">{v}</span>
            </div>
          ))}
        </Card>
        <Card>
          <p className="mb-2 font-semibold text-foreground">By Status</p>
          {Object.entries(byStatus).map(([k, v]) => (
            <div
              key={k}
              className="flex items-center justify-between border-b border-border/50 py-1.5 text-sm"
            >
              <span className="capitalize text-muted-foreground">{k.replace(/_/g, " ")}</span>
              <span className="font-medium text-foreground">{v}</span>
            </div>
          ))}
        </Card>
      </div>
    </div>
  );
}
