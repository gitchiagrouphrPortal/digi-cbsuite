import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Link } from "@tanstack/react-router";
import { listRecordsFn } from "@/lib/records.functions";
import type { RecordDTO } from "@/lib/records-schema";
import { AppPageHeader, Card, EmptyState, Pill } from "@/components/app-primitives";
import { Loader2, Calendar } from "lucide-react";

export const Route = createFileRoute("/app/training/calendar")({
  head: () => ({ meta: [{ title: "Training Calendar — DigiCB" }] }),
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
        const r = await list({ data: { collection: "enrolments", archived: false } });
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

  const sorted = items
    .filter((r) => r.data.startDate)
    .sort((a, b) => (String(a.data.startDate) < String(b.data.startDate) ? -1 : 1));

  return (
    <div>
      <AppPageHeader
        title="Training Calendar"
        description="Scheduled training batches, sessions and enrolments across all delivery modes."
      >
        <Link
          to="/app/calendar"
          className="inline-flex h-9 items-center gap-1.5 rounded-md border border-input bg-background px-3 text-sm font-medium text-foreground hover:bg-accent"
        >
          <Calendar className="h-4 w-4" /> Full Calendar
        </Link>
      </AppPageHeader>
      {loading ? (
        <Card className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" /> Loading calendar…
        </Card>
      ) : sorted.length === 0 ? (
        <EmptyState
          title="No scheduled training"
          body="Enrolments with start dates will appear here."
        />
      ) : (
        <div className="space-y-2">
          {sorted.map((r) => (
            <Card key={r.id} className="flex items-center justify-between py-3">
              <div className="flex items-center gap-3">
                <Pill tone="info">{String(r.data.batch ?? "Batch")}</Pill>
                <div>
                  <p className="font-medium text-foreground">{String(r.data.courseTitle ?? "")}</p>
                  <p className="text-xs text-muted-foreground">
                    {String(r.data.learnerName ?? "")} · {r.number}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Pill
                  tone={
                    r.status === "certified"
                      ? "success"
                      : r.status === "passed"
                        ? "success"
                        : "warning"
                  }
                >
                  {r.status}
                </Pill>
                <span className="text-sm text-muted-foreground">
                  {String(r.data.startDate ?? "")}
                </span>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
