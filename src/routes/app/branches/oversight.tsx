import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { getBranchesFn } from "@/lib/digicb.functions";
import { listRecordsFn } from "@/lib/records.functions";
import type { Branch } from "@/lib/digicb-types";
import type { RecordDTO } from "@/lib/records-schema";
import { AppPageHeader, Card, EmptyState, Pill } from "@/components/app-primitives";
import { Loader2 } from "lucide-react";

export const Route = createFileRoute("/app/branches/oversight")({
  head: () => ({ meta: [{ title: "Head-Office Oversight — DigiCB" }] }),
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
        title="Head-Office Oversight"
        description="Centralized oversight of branch operations: NCRs, findings, KPI compliance and corrective actions across all branches."
      />
      {loading ? (
        <Card className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" /> Loading oversight…
        </Card>
      ) : branches.length === 0 ? (
        <EmptyState title="No branches" body="Branch oversight data will appear here." />
      ) : (
        <div className="space-y-3">
          {branches.map((b) => {
            const branchNcrs = ncrs.filter((n) => n.branchId === b.id);
            return (
              <Card key={b.id}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-foreground">{b.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {b.city}, {b.country} · Manager: {b.manager}
                    </p>
                  </div>
                  <div className="flex gap-4 text-sm">
                    <div className="text-center">
                      <p className="font-display text-lg font-bold text-warning">
                        {branchNcrs.filter((n) => n.status !== "closed").length}
                      </p>
                      <p className="text-[11px] uppercase text-muted-foreground">Open NCRs</p>
                    </div>
                    <div className="text-center">
                      <p className="font-display text-lg font-bold text-success">
                        {branchNcrs.filter((n) => n.status === "closed").length}
                      </p>
                      <p className="text-[11px] uppercase text-muted-foreground">Closed</p>
                    </div>
                    <Pill tone={b.status === "active" ? "success" : "muted"}>{b.status}</Pill>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
