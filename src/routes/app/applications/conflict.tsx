import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { listRecordsFn, getCollectionDefsFn } from "@/lib/records.functions";
import { applications } from "@/lib/records-collections";
import type { RecordDTO } from "@/lib/records-schema";
import { AppPageHeader, Card, EmptyState, SectionTitle, Pill } from "@/components/app-primitives";
import { Loader2, ShieldAlert, ShieldCheck } from "lucide-react";

export const Route = createFileRoute("/app/applications/conflict")({
  head: () => ({ meta: [{ title: "Conflict & Impartiality Check — DigiCB" }] }),
  component: Page,
});

// Deterministic impartiality assessment from application declared fields.
function assess(d: Record<string, unknown>): {
  level: "clear" | "review" | "blocked";
  notes: string[];
} {
  const notes: string[] = [];
  let score = 0;
  const ci = String(d.conflictInfo ?? "").toLowerCase();
  if (d.transfer) {
    score += 2;
    notes.push("Transfer application — verify prior-body impartiality and confidentiality.");
  }
  if (ci.includes("yes") || ci.includes("relationship") || ci.includes("consult")) {
    score += 3;
    notes.push("Declared potential conflict — investigate before assignment.");
  }
  if (d.previousBody) {
    score += 1;
    notes.push("Previous certification body recorded — confirm transfer rules met.");
  }
  if (d.integrated) {
    score += 1;
    notes.push("Integrated management system — confirm combined competence without bias.");
  }
  if (score >= 3) return { level: "blocked", notes };
  if (score >= 1) return { level: "review", notes };
  notes.push("No declared conflicts. Standard impartiality declaration on file.");
  return { level: "clear", notes };
}

function Page() {
  const list = useServerFn(listRecordsFn);
  const [records, setRecords] = useState<RecordDTO[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    list({ data: { collection: "applications", archived: false } })
      .then((r) => setRecords(r.records))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [list]);

  if (loading)
    return (
      <p className="flex items-center gap-2 text-sm text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin" /> Loading…
      </p>
    );

  return (
    <div>
      <AppPageHeader
        title="Conflict & Impartiality Check"
        description="Automated impartiality screening of applications before auditor assignment and review."
      />
      {records.length === 0 ? (
        <EmptyState title="No applications" body="There are no applications to screen." />
      ) : (
        <div className="space-y-3">
          {records.map((r) => {
            const a = assess(r.data);
            return (
              <Card
                key={r.id}
                className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between"
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-mono text-xs font-semibold text-muted-foreground">
                      {r.number}
                    </p>
                    <p className="font-medium text-foreground">
                      {String(r.data.organizationName ?? "—")}
                    </p>
                  </div>
                  <ul className="mt-1.5 list-disc space-y-0.5 pl-5 text-xs text-muted-foreground">
                    {a.notes.map((n, i) => (
                      <li key={i}>{n}</li>
                    ))}
                  </ul>
                </div>
                <div className="shrink-0">
                  {a.level === "clear" && (
                    <Pill tone="success">
                      <ShieldCheck className="mr-1 h-3 w-3" /> Clear
                    </Pill>
                  )}
                  {a.level === "review" && (
                    <Pill tone="warning">
                      <ShieldAlert className="mr-1 h-3 w-3" /> Review
                    </Pill>
                  )}
                  {a.level === "blocked" && (
                    <Pill tone="danger">
                      <ShieldAlert className="mr-1 h-3 w-3" /> Blocked
                    </Pill>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
