import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { listRecordsFn } from "@/lib/records.functions";
import type { RecordDTO } from "@/lib/records-schema";
import { AppPageHeader, Card, EmptyState, DataTable, Pill } from "@/components/app-primitives";
import { Loader2 } from "lucide-react";

export const Route = createFileRoute("/app/branches/md23")({
  head: () => ({ meta: [{ title: "IAF MD 23 Evaluation — DigiCB" }] }),
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
        title="IAF MD 23 Evaluation"
        description="Branch-office oversight evaluation per IAF MD 23 / Global ACI successor: application-review quality, audit delivery, competence availability, decision timeliness, complaint handling, NCR closure, record completeness, impartiality risks and head-office oversight."
      />
      {loading ? (
        <Card className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" /> Loading evaluation…
        </Card>
      ) : items.length === 0 ? (
        <EmptyState
          title="No evaluation records"
          body="Branch oversight findings will appear here."
        />
      ) : (
        <DataTable
          headers={["Ref", "Area", "Finding", "Owner", "Status"]}
          rows={items.map((r) => [
            <span className="font-mono text-xs font-semibold text-foreground">{r.number}</span>,
            <Pill tone="info">{String(r.data.category ?? "—")}</Pill>,
            <span className="text-foreground">{String(r.data.title ?? "")}</span>,
            <span className="text-muted-foreground">{String(r.data.owner ?? "—")}</span>,
            <Pill tone={r.status === "closed" ? "success" : "warning"}>{r.status}</Pill>,
          ])}
        />
      )}
    </div>
  );
}
