import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Link } from "@tanstack/react-router";
import { listRecordsFn } from "@/lib/records.functions";
import type { RecordDTO } from "@/lib/records-schema";
import { AppPageHeader, Card, EmptyState, Pill } from "@/components/app-primitives";
import { Loader2 } from "lucide-react";

export const Route = createFileRoute("/app/resource/readiness")({
  head: () => ({ meta: [{ title: "Accreditation Readiness — DigiCB" }] }),
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
        const r = await list({ data: { collection: "resource_gaps", archived: false } });
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
        title="Accreditation Readiness Dashboard"
        description="Evidence-based readiness ratings for launching new certification schemes. Percentages are never automatically reported as 100%."
      />
      {loading ? (
        <Card className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" /> Loading readiness…
        </Card>
      ) : items.length === 0 ? (
        <EmptyState
          title="No assessments"
          body="Create a new scheme assessment to measure readiness."
          action={
            <Link
              to="/app/resource/new"
              className="inline-flex h-9 items-center rounded-md bg-primary px-3 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
            >
              + New Assessment
            </Link>
          }
        />
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {items.map((r) => {
            const gap = Number(r.data.gapPercent) || 0;
            const readiness = 100 - gap;
            return (
              <Card key={r.id}>
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-mono text-xs text-muted-foreground">{r.number}</p>
                    <h3 className="font-display text-base font-bold text-foreground">
                      {String(r.data.schemeName ?? "")}
                    </h3>
                    <p className="text-xs text-muted-foreground">
                      Target launch: {String(r.data.targetLaunch ?? "—")}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-display text-2xl font-bold text-foreground">{readiness}%</p>
                    <Pill
                      tone={readiness >= 80 ? "success" : readiness >= 50 ? "warning" : "danger"}
                    >
                      {String(r.data.readinessRating ?? "—")}
                    </Pill>
                  </div>
                </div>
                <div className="mt-3 h-2 overflow-hidden rounded-full bg-muted">
                  <div
                    className={`h-full ${readiness >= 80 ? "bg-success" : readiness >= 50 ? "bg-warning" : "bg-destructive"}`}
                    style={{ width: `${readiness}%` }}
                  />
                </div>
                <Link
                  to="/app/resource"
                  className="mt-3 inline-block text-xs font-medium text-primary hover:underline"
                >
                  View details →
                </Link>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
