import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { listRecordsFn } from "@/lib/records.functions";
import type { RecordDTO } from "@/lib/records-schema";
import { AppPageHeader, Card, EmptyState } from "@/components/app-primitives";
import { Loader2 } from "lucide-react";

export const Route = createFileRoute("/app/audits/calendar")({
  head: () => ({ meta: [{ title: "Audit Calendar — DigiCB" }] }),
  component: Page,
});

function Page() {
  const list = useServerFn(listRecordsFn);
  const [records, setRecords] = useState<RecordDTO[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    list({ data: { collection: "audits", archived: false } })
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
  const byDate: Record<string, RecordDTO[]> = {};
  records.forEach((r) => {
    const d = String(r.data.startDate ?? "");
    if (d) (byDate[d] ??= []).push(r);
  });
  const dates = Object.keys(byDate).sort();
  return (
    <div>
      <AppPageHeader title="Audit Calendar" description="Scheduled audits grouped by start date." />
      {dates.length === 0 ? (
        <EmptyState title="No scheduled audits" body="Create an audit programme to see it here." />
      ) : (
        <div className="space-y-4">
          {dates.map((d) => (
            <Card key={d}>
              <p className="mb-2 font-display text-sm font-semibold text-foreground">{d}</p>
              <div className="space-y-1.5">
                {byDate[d].map((r) => (
                  <div
                    key={r.id}
                    className="flex items-center justify-between rounded-md border border-border bg-muted/30 px-3 py-2 text-sm"
                  >
                    <span className="font-medium text-foreground">
                      {String(r.data.title ?? r.number)}
                    </span>
                    <span className="text-muted-foreground">
                      {String(r.data.clientName ?? "—")} · {String(r.data.auditType ?? "—")}
                    </span>
                  </div>
                ))}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
