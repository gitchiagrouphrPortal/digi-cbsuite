import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { getAuditLogsFn } from "@/lib/digicb.functions";
import { AppPageHeader, Card, DataTable, Pill } from "@/components/app-primitives";
import type { AuditLog } from "@/lib/digicb-types";

export const Route = createFileRoute("/app/admin/audit")({
  head: () => ({ meta: [{ title: "Audit Logs — DigiCB" }] }),
  component: AuditPage,
});

function AuditPage() {
  const getLogs = useServerFn(getAuditLogsFn);
  const [logs, setLogs] = useState<AuditLog[] | null>(null);

  useEffect(() => {
    let active = true;
    getLogs()
      .then((l) => active && setLogs(l))
      .catch(() => {});
    return () => {
      active = false;
    };
  }, [getLogs]);

  return (
    <div>
      <AppPageHeader
        title="Audit Logs"
        description="Immutable, append-only record of security and workflow events. Not editable by normal users."
      />
      <Card>
        {!logs ? (
          <p className="text-sm text-muted-foreground">Loading…</p>
        ) : (
          <DataTable
            headers={["Time", "Actor", "Action", "Detail"]}
            rows={logs.map((l) => [
              <span className="whitespace-nowrap text-xs text-muted-foreground">
                {new Date(l.ts).toLocaleString()}
              </span>,
              <span className="font-medium text-foreground">{l.actor}</span>,
              <Pill tone="muted">
                <span className="font-mono">{l.action}</span>
              </Pill>,
              <span className="text-muted-foreground">{l.detail}</span>,
            ])}
          />
        )}
      </Card>
    </div>
  );
}
