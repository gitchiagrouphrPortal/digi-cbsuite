import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Link } from "@tanstack/react-router";
import {
  calculateAllComplianceFn,
  listClausesFn,
  listFrameworksFn,
} from "@/lib/conformity.functions";
import type { ComplianceResult, ClauseDTO, FrameworkDTO } from "@/lib/conformity-schema";
import { INITIAL_FRAMEWORKS, INITIAL_COMPLIANCE } from "@/lib/conformity-client-data";
import { AppPageHeader, Card, EmptyState, SectionTitle } from "@/components/app-primitives";
import {
  ComplianceRing,
  ComplianceBar,
  StatusPill,
  ComplianceBadge,
} from "@/components/conformity-ui";
import { Loader2 } from "lucide-react";

export const Route = createFileRoute("/app/conformity/status")({
  head: () => ({
    meta: [
      { title: "Compliance Status — DigiCB" },
      {
        name: "description",
        content: "Live compliance status by framework, clause and module with drill-down.",
      },
    ],
  }),
  component: Page,
});

function Page() {
  const calcAll = useServerFn(calculateAllComplianceFn);

  const getClauses = useServerFn(listClausesFn);
  const getFws = useServerFn(listFrameworksFn);
  const [allResult, setAllResult] = useState<ComplianceResult>(INITIAL_COMPLIANCE.all);
  const [fwResults, setFwResults] = useState<Record<string, ComplianceResult>>({
    fw_17021: INITIAL_COMPLIANCE.fw_17021,
    fw_ps4992: INITIAL_COMPLIANCE.fw_ps4992,
    fw_17024: INITIAL_COMPLIANCE.fw_17024,
    fw_17065: INITIAL_COMPLIANCE.fw_17065,
  });
  const [clauses, setClauses] = useState<ClauseDTO[]>([]);
  const [frameworks, setFrameworks] = useState<FrameworkDTO[]>(INITIAL_FRAMEWORKS);
  const [active, setActive] = useState("all");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let a = true;
    (async () => {
      try {
        const [all, c, f] = await Promise.all([calcAll(), getClauses(), getFws()]);
        if (!a) return;
        if (all) {
          setAllResult(all.all);
          setFwResults(all.perFramework);
        }
        if (c) setClauses(c);
        if (f && f.length > 0) setFrameworks(f);
      } catch {
        // fallback
      }
    })();
    return () => {
      a = false;
    };
  }, [calcAll, getClauses, getFws]);

  const result = active === "all" ? allResult : (fwResults[active] ?? allResult);

  if (loading || !result) {
    return (
      <div>
        <AppPageHeader
          title="Compliance Status"
          description="Live compliance calculated from clause assessments and evidence."
        />
        <Card className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" /> Calculating…
        </Card>
      </div>
    );
  }

  const clauseResults = result.results;

  // Group by main clause (top-level number like "4", "5", "9")
  const byMain = new Map<string, { total: number; earned: number; count: number }>();
  for (const r of clauseResults) {
    const cl = clauses.find((c) => c.id === r.clauseId);
    const main = cl ? cl.number.split(".")[0] : "?";
    const cur = byMain.get(main) ?? { total: 0, earned: 0, count: 0 };
    cur.total += 100;
    cur.earned += r.score;
    cur.count += 1;
    byMain.set(main, cur);
  }

  return (
    <div>
      <AppPageHeader
        title="Compliance Status"
        description="Live compliance by framework, main clause and individual clause. Drill into any percentage to see contributing clauses."
      />

      <div className="mb-4 flex flex-wrap gap-2">
        <button
          onClick={() => setActive("all")}
          className={`rounded-md px-3 py-1.5 text-sm font-medium ${active === "all" ? "bg-primary text-primary-foreground" : "border border-input bg-background text-foreground"}`}
        >
          All
        </button>
        {frameworks.map((f) => (
          <button
            key={f.id}
            onClick={() => setActive(f.id)}
            className={`rounded-md px-3 py-1.5 text-sm font-medium ${active === f.id ? "bg-primary text-primary-foreground" : "border border-input bg-background text-foreground"}`}
          >
            {f.label}
          </button>
        ))}
      </div>

      <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="flex flex-col items-center justify-center">
          <ComplianceRing pct={result.overallReadiness} label="Overall Readiness" />
        </Card>
        <Card>
          <SectionTitle>Metrics</SectionTitle>
          <div className="mt-3 space-y-2 text-sm">
            <Metric label="Evidence Coverage" value={`${result.evidenceCoverage}%`} />
            <Metric label="Assessment Coverage" value={`${result.assessmentCoverage}%`} />
            <Metric label="Assessed Conformity" value={`${result.assessedConformity}%`} />
            <Metric label="Approved Exclusions" value={result.approvedExclusions} />
          </div>
        </Card>
        <Card>
          <SectionTitle>Clause Status</SectionTitle>
          <div className="mt-3 space-y-2 text-sm">
            <Metric label="Conforming" value={result.conforming} tone="text-success" />
            <Metric label="Partially Conforming" value={result.partial} tone="text-warning" />
            <Metric label="Nonconforming" value={result.nonconforming} tone="text-destructive" />
            <Metric label="Unassessed" value={result.unassessed} tone="text-muted-foreground" />
          </div>
        </Card>
        <Card>
          <SectionTitle>Evidence</SectionTitle>
          <div className="mt-3 space-y-2 text-sm">
            <Metric label="Missing Evidence" value={result.missingEvidence} tone="text-warning" />
            <Metric
              label="Expired Evidence"
              value={result.expiredEvidence}
              tone="text-destructive"
            />
            <Metric label="Total Applicable" value={result.totalApplicable} />
          </div>
        </Card>
      </div>

      <Card className="mb-6">
        <SectionTitle>Compliance by Main Clause</SectionTitle>
        <div className="mt-3 space-y-3">
          {Array.from(byMain.entries())
            .sort((a, b) => a[0].localeCompare(b[0], undefined, { numeric: true }))
            .map(([main, v]) => (
              <Link key={main} to="/app/conformity/clauses" className="block">
                <ComplianceBar
                  pct={Math.round((v.earned / v.total) * 100)}
                  label={`Clause ${main} — ${v.count} subclauses`}
                />
              </Link>
            ))}
        </div>
      </Card>

      <Card>
        <SectionTitle>Clause-Level Results — Drill-down</SectionTitle>
        <p className="mt-1 text-xs text-muted-foreground">
          Each row contributes to the percentages above. Select a clause to view its assessment.
        </p>
        <div className="mt-3 max-h-[500px] overflow-y-auto">
          <table className="w-full text-sm">
            <thead className="sticky top-0 bg-card">
              <tr className="border-b border-border text-left text-[11px] uppercase tracking-wide text-muted-foreground">
                <th className="px-3 py-2">Clause</th>
                <th className="px-3 py-2">Title</th>
                <th className="px-3 py-2">Status</th>
                <th className="px-3 py-2">Score</th>
                <th className="px-3 py-2">Evidence</th>
              </tr>
            </thead>
            <tbody>
              {clauseResults.map((r) => {
                const cl = clauses.find((c) => c.id === r.clauseId);
                return (
                  <tr key={r.clauseId} className="border-b border-border/60 hover:bg-muted/30">
                    <td className="px-3 py-2.5">
                      <Link
                        to="/app/conformity/assessments"
                        className="font-mono text-xs font-semibold text-primary hover:underline"
                      >
                        {cl?.number ?? r.number}
                      </Link>
                    </td>
                    <td className="px-3 py-2.5 text-xs text-foreground">{cl?.title ?? r.title}</td>
                    <td className="px-3 py-2.5">
                      <StatusPill status={r.status} compact />
                    </td>
                    <td className="px-3 py-2.5">
                      <ComplianceBadge pct={r.score} />
                    </td>
                    <td className="px-3 py-2.5 text-xs">
                      {r.hasValidEvidence ? (
                        <span className="text-success">valid</span>
                      ) : (
                        <span className="text-warning">missing/expired</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

function Metric({ label, value, tone }: { label: string; value: string | number; tone?: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-muted-foreground">{label}</span>
      <span className={`font-display font-bold ${tone ?? "text-foreground"}`}>{value}</span>
    </div>
  );
}
