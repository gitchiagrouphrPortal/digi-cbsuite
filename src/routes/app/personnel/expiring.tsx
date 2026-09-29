import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { listRecordsFn } from "@/lib/records.functions";
import type { RecordDTO } from "@/lib/records-schema";
import { AppPageHeader, Card, EmptyState, DataTable, Pill } from "@/components/app-primitives";
import { Loader2, AlertTriangle } from "lucide-react";
import { Link } from "@tanstack/react-router";

export const Route = createFileRoute("/app/personnel/expiring")({
  head: () => ({ meta: [{ title: "Expiring Authorizations — DigiCB" }] }),
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

  const today = new Date();
  const inDays = (d: number) => {
    const x = new Date(today);
    x.setDate(x.getDate() + d);
    return x.toISOString().split("T")[0];
  };
  const warn90 = inDays(90);
  const expiring = items.filter((r) => {
    const exp = r.data.authExpiry as string;
    return exp && exp <= warn90 && r.status === "active";
  });

  return (
    <div>
      <AppPageHeader
        title="Expiring Authorizations"
        description="Authorizations expiring within 90 days. Renew before expiry to avoid assignment blocks."
      />
      {loading ? (
        <Card className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" /> Loading…
        </Card>
      ) : expiring.length === 0 ? (
        <EmptyState
          title="No expiring authorizations"
          body="All active authorizations are valid beyond 90 days."
        />
      ) : (
        <>
          <Card className="mb-4 flex items-center gap-2 border-warning/40 bg-warning/10 p-3 text-sm text-warning">
            <AlertTriangle className="h-4 w-4" /> {expiring.length} authorization(s) expiring within
            90 days.
          </Card>
          <DataTable
            headers={["Ref", "Name", "Role", "Expiry", "Approver", "Action"]}
            rows={expiring.map((r) => [
              <span className="font-mono text-xs font-semibold text-foreground">{r.number}</span>,
              <span className="font-medium text-foreground">{String(r.data.name ?? "—")}</span>,
              <Pill tone="info">{String(r.data.role ?? "—")}</Pill>,
              <Pill tone="danger">{String(r.data.authExpiry ?? "—")}</Pill>,
              <span className="text-muted-foreground">{String(r.data.authApprover ?? "—")}</span>,
              <Link
                to="/app/personnel/$id"
                params={{ id: r.id }}
                className="text-xs font-semibold text-primary hover:underline"
              >
                Review
              </Link>,
            ])}
          />
        </>
      )}
    </div>
  );
}
