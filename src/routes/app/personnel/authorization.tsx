import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { listRecordsFn } from "@/lib/records.functions";
import type { RecordDTO } from "@/lib/records-schema";
import { AppPageHeader, Card, EmptyState, DataTable, Pill } from "@/components/app-primitives";
import { StatusBadge } from "@/components/status-badges";
import { personnel } from "@/lib/records-collections-ext";
import { Loader2 } from "lucide-react";

export const Route = createFileRoute("/app/personnel/authorization")({
  head: () => ({ meta: [{ title: "Authorization Matrix — DigiCB" }] }),
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
        title="Authorization Matrix"
        description="Authorization scope, dates, approver and current status. Suspended or withdrawn authorizations block audit, review and decision assignments."
      />
      {loading ? (
        <Card className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" /> Loading…
        </Card>
      ) : items.length === 0 ? (
        <EmptyState title="No personnel" body="" />
      ) : (
        <DataTable
          headers={[
            "Ref",
            "Name",
            "Role",
            "Auth Scope",
            "Auth Date",
            "Expiry",
            "Approver",
            "Status",
          ]}
          rows={items.map((r) => [
            <span className="font-mono text-xs font-semibold text-foreground">{r.number}</span>,
            <span className="font-medium text-foreground">{String(r.data.name ?? "—")}</span>,
            <Pill tone="info">{String(r.data.role ?? "—")}</Pill>,
            <span className="text-muted-foreground">
              {String(r.data.authorizationScope ?? "—")}
            </span>,
            <span className="text-muted-foreground">{String(r.data.authDate ?? "—")}</span>,
            <span className="text-muted-foreground">{String(r.data.authExpiry ?? "—")}</span>,
            <span className="text-muted-foreground">{String(r.data.authApprover ?? "—")}</span>,
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
