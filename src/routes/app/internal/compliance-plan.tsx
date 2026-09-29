import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Link } from "@tanstack/react-router";
import { listRecordsFn } from "@/lib/records.functions";
import type { RecordDTO } from "@/lib/records-schema";
import { AppPageHeader, Card, EmptyState, Pill } from "@/components/app-primitives";
import { Loader2, Calendar } from "lucide-react";

export const Route = createFileRoute("/app/internal/compliance-plan")({
  head: () => ({ meta: [{ title: "Annual Compliance Plan — DigiCB" }] }),
  component: Page,
});

function Page() {
  const list = useServerFn(listRecordsFn);
  const [audits, setAudits] = useState<RecordDTO[]>([]);
  const [reviews, setReviews] = useState<RecordDTO[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let a = true;
    (async () => {
      try {
        const [ia, mr] = await Promise.all([
          list({ data: { collection: "internal_audits", archived: false } }),
          list({ data: { collection: "mgmt_reviews", archived: false } }),
        ]);
        if (!a) return;
        setAudits(ia.records);
        setReviews(mr.records);
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

  const upcoming = [
    ...audits.map((r) => ({
      ref: r.number,
      title: String(r.data.title ?? ""),
      date: String(r.data.auditDate ?? ""),
      type: "Internal Audit",
    })),
    ...reviews.map((r) => ({
      ref: r.number,
      title: String(r.data.title ?? ""),
      date: String(r.data.date ?? ""),
      type: "Management Review",
    })),
  ].sort((a, b) => (a.date < b.date ? -1 : 1));

  return (
    <div>
      <AppPageHeader
        title="Annual Compliance Plan"
        description="Recurring compliance calendar covering internal audits, management reviews, impartiality meetings, document reviews, witness audits and accreditation surveillance."
      >
        <Link
          to="/app/calendar"
          className="inline-flex h-9 items-center gap-1.5 rounded-md border border-input bg-background px-3 text-sm font-medium text-foreground hover:bg-accent"
        >
          <Calendar className="h-4 w-4" /> Calendar
        </Link>
      </AppPageHeader>
      {loading ? (
        <Card className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" /> Loading plan…
        </Card>
      ) : upcoming.length === 0 ? (
        <EmptyState
          title="No scheduled activities"
          body="Internal audits and management reviews will appear here."
        />
      ) : (
        <div className="space-y-2">
          {upcoming.map((u, i) => (
            <Card key={i} className="flex items-center justify-between py-3">
              <div className="flex items-center gap-3">
                <Pill tone={u.type === "Internal Audit" ? "info" : "warning"}>{u.type}</Pill>
                <div>
                  <p className="font-medium text-foreground">{u.title}</p>
                  <p className="font-mono text-xs text-muted-foreground">{u.ref}</p>
                </div>
              </div>
              <span className="text-sm text-muted-foreground">{u.date || "Unscheduled"}</span>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
