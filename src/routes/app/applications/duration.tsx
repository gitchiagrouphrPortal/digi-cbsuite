import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { listRecordsFn } from "@/lib/records.functions";
import { applications } from "@/lib/records-collections";
import type { RecordDTO } from "@/lib/records-schema";
import { AppPageHeader, Card, EmptyState, SectionTitle } from "@/components/app-primitives";
import { Loader2, Calculator } from "lucide-react";

export const Route = createFileRoute("/app/applications/duration")({
  head: () => ({ meta: [{ title: "Audit-Duration Calculation — DigiCB" }] }),
  component: Page,
});

// Simplified audit-duration estimator per IAF MD 5 / 17021-1 principles.
function estimate(d: Record<string, unknown>): string {
  const emp = Number(d.employees ?? 0) || 0;
  const sites = Number(d.sites ?? 1) || 1;
  const shifts = Number(d.shifts ?? 1) || 1;
  let base = 1.5; // base days
  if (emp > 0 && emp <= 10) base = 1.5;
  else if (emp <= 50) base = 2.5;
  else if (emp <= 200) base = 4;
  else if (emp <= 1000) base = 6;
  else if (emp > 1000) base = 8;
  const riskMul = d.riskCategory === "high" ? 1.3 : d.riskCategory === "medium" ? 1.15 : 1.0;
  const complexityMul = d.complexity === "high" ? 1.25 : d.complexity === "medium" ? 1.1 : 1.0;
  const multiSite = d.multiSite ? 1.15 : 1.0;
  const integrated = d.integrated ? 1.2 : 1.0;
  const remote = d.remote ? 0.9 : 1.0;
  const days = (
    base *
    riskMul *
    complexityMul *
    multiSite *
    integrated *
    remote *
    Math.sqrt(sites) *
    (shifts > 1 ? 1.1 : 1)
  ).toFixed(1);
  return days;
}

function Page() {
  const list = useServerFn(listRecordsFn);
  const [records, setRecords] = useState<RecordDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [selId, setSelId] = useState("");

  useEffect(() => {
    list({ data: { collection: "applications", archived: false } })
      .then((r) => {
        setRecords(r.records);
        if (r.records[0]) setSelId(r.records[0].id);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [list]);

  const sel = records.find((r) => r.id === selId);

  if (loading)
    return (
      <p className="flex items-center gap-2 text-sm text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin" /> Loading…
      </p>
    );

  return (
    <div>
      <AppPageHeader
        title="Audit-Duration Calculation"
        description="Estimate on-site audit duration per IAF MD 5 and ISO/IEC 17021-1 principles using application risk and complexity data."
      />
      <Card className="mb-4">
        <SectionTitle>Select Application</SectionTitle>
        <div className="mt-3">
          <select
            value={selId}
            onChange={(e) => setSelId(e.target.value)}
            className="h-9 w-full max-w-md rounded-md border border-input bg-background px-3 text-sm text-foreground outline-none focus:ring-2 focus:ring-ring"
          >
            {records.length === 0 && <option value="">No applications</option>}
            {records.map((r) => (
              <option key={r.id} value={r.id}>
                {r.number} — {String(r.data.organizationName ?? "Unknown")}
              </option>
            ))}
          </select>
        </div>
      </Card>
      {!sel ? (
        <EmptyState
          title="No application selected"
          body="Select an application to calculate the recommended audit duration."
        />
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          <Card>
            <SectionTitle>Application Inputs</SectionTitle>
            <dl className="mt-3 space-y-1.5 text-sm">
              <Row k="Organization" v={String(sel.data.organizationName ?? "—")} />
              <Row k="Standard" v={String(sel.data.standard ?? "—")} />
              <Row k="Employees" v={String(sel.data.employees ?? "—")} />
              <Row k="Sites" v={String(sel.data.sites ?? 1)} />
              <Row k="Shifts" v={String(sel.data.shifts ?? 1)} />
              <Row k="Risk category" v={String(sel.data.riskCategory ?? "—")} />
              <Row k="Complexity" v={String(sel.data.complexity ?? "—")} />
              <Row k="Multi-site" v={sel.data.multiSite ? "Yes" : "No"} />
              <Row k="Integrated" v={sel.data.integrated ? "Yes" : "No"} />
              <Row k="Remote activities" v={sel.data.remote ? "Yes" : "No"} />
            </dl>
          </Card>
          <Card>
            <div className="flex items-center gap-2">
              <Calculator className="h-4 w-4 text-primary" />
              <SectionTitle>Recommended Duration</SectionTitle>
            </div>
            <p className="mt-4 font-display text-5xl font-bold text-primary">
              {estimate(sel.data)}
              <span className="ml-2 text-lg font-medium text-muted-foreground">on-site days</span>
            </p>
            <p className="mt-3 text-xs text-muted-foreground">
              Estimate applies risk &amp; complexity multipliers, multi-site sampling root,
              integrated-system uplift and remote reduction. Confirm against the scheme-specific
              duration tables before finalizing the audit plan.
            </p>
          </Card>
        </div>
      )}
    </div>
  );
}

function Row({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex justify-between border-b border-border/50 py-1">
      <dt className="text-muted-foreground">{k}</dt>
      <dd className="font-medium text-foreground">{v}</dd>
    </div>
  );
}
