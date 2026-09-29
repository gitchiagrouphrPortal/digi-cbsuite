import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { listRecordsFn } from "@/lib/records.functions";
import type { RecordDTO } from "@/lib/records-schema";
import { AppPageHeader, Card, EmptyState, DataTable, Pill } from "@/components/app-primitives";
import { StatusBadge } from "@/components/status-badges";
import { projects } from "@/lib/records-collections";
import { Loader2, Download } from "lucide-react";
import { exportRowsCSV } from "@/components/app-primitives";
import { toast } from "sonner";

export const Route = createFileRoute("/app/reports/certification")({
  head: () => ({ meta: [{ title: "Certification Reports — DigiCB" }] }),
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
        const r = await list({ data: { collection: "projects", archived: false } });
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

  const byStatus = items.reduce<Record<string, number>>((acc, r) => {
    acc[r.status] = (acc[r.status] ?? 0) + 1;
    return acc;
  }, {});

  return (
    <div>
      <AppPageHeader
        title="Certification Reports"
        description="Certification pipeline, project status and certificate expiry reports."
      >
        <button
          onClick={() => {
            exportRowsCSV(
              "certification_report",
              items.map((r) => ({
                number: r.number,
                client: r.data.clientName,
                standard: r.data.standard,
                status: r.status,
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
        <EmptyState title="No projects" body="" />
      ) : (
        <>
          <div className="mb-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
            <Card className="p-3">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                Total Projects
              </p>
              <p className="font-display text-xl font-bold text-foreground">{items.length}</p>
            </Card>
            <Card className="p-3">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                Active
              </p>
              <p className="font-display text-xl font-bold text-success">
                {items.filter((r) => !r.archived).length}
              </p>
            </Card>
            <Card className="p-3">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                Issued
              </p>
              <p className="font-display text-xl font-bold text-success">
                {byStatus["certificate_issued"] ?? 0}
              </p>
            </Card>
            <Card className="p-3">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                In Decision
              </p>
              <p className="font-display text-xl font-bold text-warning">
                {byStatus["certification_decision"] ?? 0}
              </p>
            </Card>
          </div>
          <DataTable
            headers={["Project", "Client", "Standard", "Framework", "Status", "Owner"]}
            rows={items.map((r) => [
              <span className="font-mono text-xs font-semibold text-foreground">{r.number}</span>,
              <span className="text-foreground">{String(r.data.clientName ?? "")}</span>,
              <span className="text-muted-foreground">{String(r.data.standard ?? "—")}</span>,
              <Pill tone="info">{String(r.data.framework ?? "—")}</Pill>,
              <StatusBadge
                status={r.status}
                label={projects.statuses.find((s) => s.value === r.status)?.label}
              />,
              <span className="text-muted-foreground">{String(r.data.owner ?? "—")}</span>,
            ])}
          />
        </>
      )}
    </div>
  );
}
