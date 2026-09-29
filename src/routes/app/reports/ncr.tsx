import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { listRecordsFn } from "@/lib/records.functions";
import type { RecordDTO } from "@/lib/records-schema";
import { AppPageHeader, Card, EmptyState, DataTable, Pill } from "@/components/app-primitives";
import { StatusBadge } from "@/components/status-badges";
import { ncrs } from "@/lib/records-collections-ext";
import { Loader2, Download } from "lucide-react";
import { exportRowsCSV } from "@/components/app-primitives";
import { toast } from "sonner";

export const Route = createFileRoute("/app/reports/ncr")({
  head: () => ({ meta: [{ title: "NCR Reports — DigiCB" }] }),
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
        const r = await list({ data: { collection: "ncrs", archived: false } });
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

  const open = items.filter((r) => r.status !== "closed");
  const overdue = items.filter((r) => {
    const t = r.data.targetDate as string;
    return t && t < new Date().toISOString().split("T")[0] && r.status !== "closed";
  });

  return (
    <div>
      <AppPageHeader
        title="NCR Reports"
        description="NCR status, aging, recurring-cause analysis and trend reports."
      >
        <button
          onClick={() => {
            exportRowsCSV(
              "ncr_report",
              items.map((r) => ({
                number: r.number,
                classification: r.data.classification,
                client: r.data.clientName,
                clause: r.data.clause,
                status: r.status,
                targetDate: r.data.targetDate,
                owner: r.data.owner,
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
        <EmptyState title="No NCRs" body="" />
      ) : (
        <>
          <div className="mb-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
            <Card className="p-3">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                Total
              </p>
              <p className="font-display text-xl font-bold text-foreground">{items.length}</p>
            </Card>
            <Card className="p-3">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                Open
              </p>
              <p className="font-display text-xl font-bold text-warning">{open.length}</p>
            </Card>
            <Card className="p-3">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                Overdue
              </p>
              <p className="font-display text-xl font-bold text-destructive">{overdue.length}</p>
            </Card>
            <Card className="p-3">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                Closed
              </p>
              <p className="font-display text-xl font-bold text-success">
                {items.filter((r) => r.status === "closed").length}
              </p>
            </Card>
          </div>
          <DataTable
            headers={["NCR", "Class", "Client", "Clause", "Target", "Status"]}
            rows={items.map((r) => [
              <span className="font-mono text-xs font-semibold text-foreground">{r.number}</span>,
              <Pill tone={r.data.classification === "major" ? "danger" : "warning"}>
                {String(r.data.classification ?? "—")}
              </Pill>,
              <span className="text-foreground">{String(r.data.clientName ?? "")}</span>,
              <span className="text-muted-foreground">{String(r.data.clause ?? "—")}</span>,
              <span className="text-muted-foreground">{String(r.data.targetDate ?? "—")}</span>,
              <StatusBadge
                status={r.status}
                label={ncrs.statuses.find((s) => s.value === r.status)?.label}
              />,
            ])}
          />
        </>
      )}
    </div>
  );
}
