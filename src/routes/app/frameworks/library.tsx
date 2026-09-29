import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { listStandardsFn } from "@/lib/conformity.functions";
import type { StandardDTO } from "@/lib/conformity-schema";
import { AppPageHeader, Card, EmptyState, DataTable, Pill } from "@/components/app-primitives";
import { Loader2 } from "lucide-react";

export const Route = createFileRoute("/app/frameworks/library")({
  head: () => ({ meta: [{ title: "IAF / Global ACI Documents — DigiCB" }] }),
  component: Page,
});

function Page() {
  const get = useServerFn(listStandardsFn);
  const [items, setItems] = useState<StandardDTO[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let a = true;
    (async () => {
      try {
        const r = await get();
        if (a) setItems(r || []);
      } catch {
        /* */
      } finally {
        if (a) setLoading(false);
      }
    })();
    return () => {
      a = false;
    };
  }, [get]);

  return (
    <div>
      <AppPageHeader
        title="IAF / Global ACI Document Library"
        description="Legacy IAF documents retained alongside current Global ACI publications, with effective dates and supersession relationships. IAF ceased operations 1 January 2026."
      />
      {loading ? (
        <Card className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" /> Loading documents…
        </Card>
      ) : items.length === 0 ? (
        <EmptyState
          title="No documents"
          body="Standards are seeded on first access to the Conformity engine."
        />
      ) : (
        <DataTable
          headers={["Document", "Title", "Edition", "Effective", "Status", "Supersession"]}
          rows={items.map((s) => [
            <span className="font-mono text-xs font-semibold text-foreground">{s.number}</span>,
            <span className="text-foreground">{s.title}</span>,
            <span className="text-muted-foreground">{s.edition}</span>,
            <span className="text-muted-foreground">{s.effectiveDate}</span>,
            <Pill
              tone={
                s.status === "current"
                  ? "success"
                  : s.status === "transition"
                    ? "warning"
                    : s.status === "superseded"
                      ? "muted"
                      : "info"
              }
            >
              {s.status}
            </Pill>,
            <span className="text-xs text-muted-foreground">
              {s.supersedes
                ? `↪ supersedes ${s.supersedes}`
                : s.supersededBy
                  ? `↪ superseded by ${s.supersededBy}`
                  : "—"}
            </span>,
          ])}
        />
      )}
    </div>
  );
}
