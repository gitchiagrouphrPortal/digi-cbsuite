import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { listRecordsFn } from "@/lib/records.functions";
import type { RecordDTO } from "@/lib/records-schema";
import { AppPageHeader, Card, EmptyState, DataTable, Pill } from "@/components/app-primitives";
import { Loader2 } from "lucide-react";
import { Link } from "@tanstack/react-router";

export const Route = createFileRoute("/app/personnel/gaps")({
  head: () => ({ meta: [{ title: "Competence Gaps — DigiCB" }] }),
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

  // Identify gaps: low CPD, missing conflict declaration, suspended, or missing framework coverage
  const gaps = items
    .map((r) => {
      const issues: string[] = [];
      const cpd = Number(r.data.cpdHours ?? 0);
      if (cpd < 20) issues.push(`Low CPD (${cpd}h)`);
      if (!r.data.conflictDeclared) issues.push("No conflict declaration");
      if (r.status === "suspended") issues.push("Authorization suspended");
      if (!r.data.frameworks) issues.push("No frameworks mapped");
      return { r, issues };
    })
    .filter((g) => g.issues.length > 0);

  return (
    <div>
      <AppPageHeader
        title="Competence Gaps"
        description="Identified competence and authorization gaps with development plans. Gaps block assignments until resolved."
      />
      {loading ? (
        <Card className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" /> Loading…
        </Card>
      ) : gaps.length === 0 ? (
        <EmptyState
          title="No competence gaps"
          body="All personnel meet current competence criteria."
        />
      ) : (
        <DataTable
          headers={["Ref", "Name", "Role", "Gaps Identified", "Action"]}
          rows={gaps.map(({ r, issues }) => [
            <span className="font-mono text-xs font-semibold text-foreground">{r.number}</span>,
            <span className="font-medium text-foreground">{String(r.data.name ?? "—")}</span>,
            <Pill tone="info">{String(r.data.role ?? "—")}</Pill>,
            <div className="flex flex-wrap gap-1">
              {issues.map((i) => (
                <Pill key={i} tone="warning">
                  {i}
                </Pill>
              ))}
            </div>,
            <Link
              to="/app/personnel/$id"
              params={{ id: r.id }}
              className="text-xs font-semibold text-primary hover:underline"
            >
              Development plan
            </Link>,
          ])}
        />
      )}
    </div>
  );
}
