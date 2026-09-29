import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { listRecordsFn } from "@/lib/records.functions";
import type { RecordDTO } from "@/lib/records-schema";
import { AppPageHeader, Card, EmptyState, DataTable, Pill } from "@/components/app-primitives";
import { StatusBadge } from "@/components/status-badges";
import { risks } from "@/lib/records-collections-ext";
import { Loader2 } from "lucide-react";

export const Route = createFileRoute("/app/frameworks/findings")({
  head: () => ({ meta: [{ title: "Accreditation Findings — DigiCB" }] }),
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
        const r = await list({ data: { collection: "risks", archived: false } });
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

  return (
    <div>
      <AppPageHeader
        title="Accreditation Findings"
        description="Findings and risks from accreditation-body assessments, surveillance visits and internal audits, tracked to closure."
      />
      {loading ? (
        <Card className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" /> Loading findings…
        </Card>
      ) : items.length === 0 ? (
        <EmptyState
          title="No findings"
          body="Accreditation findings will appear here once recorded."
        />
      ) : (
        <DataTable
          headers={["Ref", "Finding", "Category", "Owner", "Status", "Target"]}
          rows={items.map((r) => [
            <span className="font-mono text-xs font-semibold text-foreground">{r.number}</span>,
            <span className="text-foreground">{String(r.data.title ?? "")}</span>,
            <Pill tone="info">{String(r.data.category ?? "—")}</Pill>,
            <span className="text-muted-foreground">{String(r.data.owner ?? "—")}</span>,
            <StatusBadge
              status={r.status}
              label={risks.statuses.find((s) => s.value === r.status)?.label}
            />,
            <span className="text-muted-foreground">{String(r.data.targetDate ?? "—")}</span>,
          ])}
        />
      )}
    </div>
  );
}
