import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { getBranchesFn } from "@/lib/digicb.functions";
import { listRecordsFn } from "@/lib/records.functions";
import type { Branch } from "@/lib/digicb-types";
import type { RecordDTO } from "@/lib/records-schema";
import { AppPageHeader, Card, EmptyState, DataTable, Pill } from "@/components/app-primitives";
import { Loader2, Download } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/app/reports/branches")({
  head: () => ({ meta: [{ title: "Branch Reports — DigiCB" }] }),
  component: Page,
});

function Page() {
  const getBranches = useServerFn(getBranchesFn);
  const list = useServerFn(listRecordsFn);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [ncrs, setNcrs] = useState<RecordDTO[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let a = true;
    (async () => {
      try {
        const [b, n] = await Promise.all([
          getBranches(),
          list({ data: { collection: "ncrs", archived: false } }),
        ]);
        if (!a) return;
        setBranches(b || []);
        setNcrs(n.records);
      } catch {
        /* */
      } finally {
        if (a) setLoading(false);
      }
    })();
    return () => {
      a = false;
    };
  }, [getBranches, list]);

  return (
    <div>
      <AppPageHeader
        title="Branch Performance Reports"
        description="Branch performance per IAF MD 23 oversight: NCR closure, record completeness, impartiality risks and head-office oversight."
      >
        <button
          onClick={() => {
            const rows = branches.map((b) => ({
              branch: b.name,
              type: b.type,
              country: b.country,
              openNcrs: ncrs.filter((n) => n.branchId === b.id && n.status !== "closed").length,
              closedNcrs: ncrs.filter((n) => n.branchId === b.id && n.status === "closed").length,
              status: b.status,
            }));
            exportBranchCSV(rows);
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
      ) : branches.length === 0 ? (
        <EmptyState title="No branches" body="" />
      ) : (
        <DataTable
          headers={["Branch", "Type", "Country", "Open NCRs", "Closed NCRs", "Status"]}
          rows={branches.map((b) => [
            <span className="font-medium text-foreground">{b.name}</span>,
            <Pill tone={b.type === "head_office" ? "success" : "info"}>
              {b.type.replace(/_/g, " ")}
            </Pill>,
            <span className="text-muted-foreground">{b.country}</span>,
            <span className="font-mono font-semibold text-warning">
              {ncrs.filter((n) => n.branchId === b.id && n.status !== "closed").length}
            </span>,
            <span className="font-mono font-semibold text-success">
              {ncrs.filter((n) => n.branchId === b.id && n.status === "closed").length}
            </span>,
            <Pill tone={b.status === "active" ? "success" : "muted"}>{b.status}</Pill>,
          ])}
        />
      )}
    </div>
  );
}

function exportBranchCSV(rows: Record<string, unknown>[]) {
  if (rows.length === 0) return;
  const headers = Object.keys(rows[0]);
  const csv = [
    headers.join(","),
    ...rows.map((r) => headers.map((h) => `"${String(r[h] ?? "").replace(/"/g, '""')}"`).join(",")),
  ].join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "branch_report.csv";
  a.click();
  URL.revokeObjectURL(url);
}
