import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { listRecordsFn } from "@/lib/records.functions";
import type { RecordDTO } from "@/lib/records-schema";
import { AppPageHeader, Card, EmptyState, DataTable, Pill } from "@/components/app-primitives";
import { StatusBadge } from "@/components/status-badges";
import { audits } from "@/lib/records-collections-ext";
import { Loader2, Download } from "lucide-react";
import { exportRowsCSV } from "@/components/app-primitives";
import { toast } from "sonner";

export const Route = createFileRoute("/app/reports/audits")({
  head: () => ({ meta: [{ title: "Audit Reports — DigiCB" }] }),
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
        const r = await list({ data: { collection: "audits", archived: false } });
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
        title="Audit Reports"
        description="Audit programmes, duration justification, auditor utilization and audit delivery reports."
      >
        <button
          onClick={() => {
            exportRowsCSV(
              "audit_report",
              items.map((r) => ({
                number: r.number,
                title: r.data.title,
                client: r.data.clientName,
                type: r.data.auditType,
                status: r.status,
                duration: r.data.duration,
                teamLeader: r.data.teamLeader,
              })),
            );
            toast.success("Report exported as CSV");
          }}
          className="inline-flex h-9 items-center gap-1.5 rounded-md border border-input bg-background px-3 text-sm font-medium text-foreground hover:bg-accent"
        >
          <Download className="h-4 w-4" /> Export CSV
        </button>
      </AppPageHeader>
      {loading ? (
        <Card className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" /> Loading…
        </Card>
      ) : items.length === 0 ? (
        <EmptyState title="No audits" body="" />
      ) : (
        <DataTable
          headers={["Audit", "Client", "Type", "Duration", "Team Leader", "Status"]}
          rows={items.map((r) => [
            <span className="font-mono text-xs font-semibold text-foreground">{r.number}</span>,
            <span className="text-foreground">{String(r.data.clientName ?? "")}</span>,
            <Pill tone="info">{String(r.data.auditType ?? "—")}</Pill>,
            <span className="text-muted-foreground">{String(r.data.duration ?? "—")} days</span>,
            <span className="text-muted-foreground">{String(r.data.teamLeader ?? "—")}</span>,
            <StatusBadge
              status={r.status}
              label={audits.statuses.find((s) => s.value === r.status)?.label}
            />,
          ])}
        />
      )}
    </div>
  );
}
