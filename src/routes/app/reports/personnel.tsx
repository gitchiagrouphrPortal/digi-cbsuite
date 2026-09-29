import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { listRecordsFn } from "@/lib/records.functions";
import type { RecordDTO } from "@/lib/records-schema";
import { AppPageHeader, Card, EmptyState, DataTable, Pill } from "@/components/app-primitives";
import { StatusBadge } from "@/components/status-badges";
import { personnel } from "@/lib/records-collections-ext";
import { Loader2, Download } from "lucide-react";
import { exportRowsCSV } from "@/components/app-primitives";
import { toast } from "sonner";

export const Route = createFileRoute("/app/reports/personnel")({
  head: () => ({ meta: [{ title: "Personnel Reports — DigiCB" }] }),
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
        const r = await list({ data: { collection: "personnel", archived: false } });
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
        title="Personnel & Competence Reports"
        description="Competence, authorization, CPD and performance reports across all personnel."
      >
        <button
          onClick={() => {
            exportRowsCSV(
              "personnel_report",
              items.map((r) => ({
                number: r.number,
                name: r.data.name,
                role: r.data.role,
                sectors: r.data.sectors,
                authExpiry: r.data.authExpiry,
                cpdHours: r.data.cpdHours,
                status: r.status,
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
        <EmptyState title="No personnel" body="" />
      ) : (
        <DataTable
          headers={["Ref", "Name", "Role", "Sectors", "Auth Expiry", "CPD", "Status"]}
          rows={items.map((r) => [
            <span className="font-mono text-xs font-semibold text-foreground">{r.number}</span>,
            <span className="font-medium text-foreground">{String(r.data.name ?? "")}</span>,
            <Pill tone="info">{String(r.data.role ?? "—")}</Pill>,
            <span className="text-muted-foreground">{String(r.data.sectors ?? "—")}</span>,
            <span className="text-muted-foreground">{String(r.data.authExpiry ?? "—")}</span>,
            <span className="text-muted-foreground">{String(r.data.cpdHours ?? "—")} hrs</span>,
            <StatusBadge
              status={r.status}
              label={personnel.statuses.find((s) => s.value === r.status)?.label}
            />,
          ])}
        />
      )}
    </div>
  );
}
