import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { listRecordsFn } from "@/lib/records.functions";
import type { RecordDTO } from "@/lib/records-schema";
import { AppPageHeader, Card, EmptyState, DataTable, Pill } from "@/components/app-primitives";
import { Loader2 } from "lucide-react";
import { FRAMEWORKS } from "@/lib/records-constants";

export const Route = createFileRoute("/app/personnel/competence")({
  head: () => ({ meta: [{ title: "Competence Matrix — DigiCB" }] }),
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

  const cell = (person: RecordDTO, fwId: string) => {
    const fws = String(person.data.frameworks ?? "").toLowerCase();
    const has = fws.includes(fwId) || fws.includes(fwId.replace(/\s/g, ""));
    const authed = person.status === "active";
    if (has && authed) return <span className="font-mono text-success">●</span>;
    if (has) return <span className="font-mono text-warning">◐</span>;
    return <span className="font-mono text-muted-foreground/30">○</span>;
  };

  return (
    <div>
      <AppPageHeader
        title="Competence Matrix"
        description="Personnel mapped against accreditation framework, scheme, standard, technical sector and role. Unauthorized assignments are blocked automatically."
      />
      {loading ? (
        <Card className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" /> Loading…
        </Card>
      ) : items.length === 0 ? (
        <EmptyState title="No personnel" body="" />
      ) : (
        <Card>
          <div className="mb-3 flex flex-wrap gap-3 text-xs text-muted-foreground">
            <span>
              <span className="font-mono text-success">●</span> Authorized
            </span>
            <span>
              <span className="font-mono text-warning">◐</span> Mapped, not authorized
            </span>
            <span>
              <span className="font-mono text-muted-foreground/30">○</span> Not mapped
            </span>
          </div>
          <DataTable
            headers={[
              "Ref",
              "Name",
              "Role",
              "Sectors",
              ...FRAMEWORKS.map((f) => f.label.split(" ")[0]),
            ]}
            rows={items.map((r) => [
              <span className="font-mono text-xs font-semibold text-foreground">{r.number}</span>,
              <span className="font-medium text-foreground">{String(r.data.name ?? "—")}</span>,
              <Pill tone="info">{String(r.data.role ?? "—")}</Pill>,
              <span className="text-muted-foreground">{String(r.data.sectors ?? "—")}</span>,
              ...FRAMEWORKS.map((f) => cell(r, f.value)),
            ])}
          />
        </Card>
      )}
    </div>
  );
}
