import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Link } from "@tanstack/react-router";
import { calculateComplianceFn, listClausesFn, listStandardsFn } from "@/lib/conformity.functions";
import type { ComplianceResult, ClauseDTO, StandardDTO } from "@/lib/conformity-schema";
import {
  AppPageHeader,
  Card,
  EmptyState,
  SectionTitle,
  DataTable,
  Pill,
} from "@/components/app-primitives";
import { ComplianceRing, StatCard } from "@/components/conformity-ui";
import { INITIAL_COMPLIANCE } from "@/lib/conformity-client-data";
import { Loader2 } from "lucide-react";

export const Route = createFileRoute("/app/frameworks/17021")({
  head: () => ({ meta: [{ title: "ISO/IEC 17021-1 Workspace — DigiCB" }] }),
  component: () => (
    <FrameworkWorkspace
      fwId="fw_17021"
      code="ISO/IEC 17021-1"
      title="Management Systems Certification"
    />
  ),
});

export function FrameworkWorkspace({
  fwId,
  code,
  title,
}: {
  fwId: string;
  code: string;
  title: string;
}) {
  const getComp = useServerFn(calculateComplianceFn);
  const getClauses = useServerFn(listClausesFn);
  const getStds = useServerFn(listStandardsFn);
  const fallback = (INITIAL_COMPLIANCE as Record<string, ComplianceResult>)[fwId];
  const [result, setResult] = useState<ComplianceResult | null>(fallback ?? null);
  const [clauses, setClauses] = useState<ClauseDTO[]>([]);
  const [stds, setStds] = useState<StandardDTO[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let a = true;
    (async () => {
      try {
        const [comp, cls, sts] = await Promise.all([
          getComp({ data: { frameworkId: fwId } }),
          getClauses(),
          getStds(),
        ]);
        if (!a) return;
        if (comp) setResult(comp);
        setClauses((cls || []).filter((c) => c.frameworkId === fwId));
        setStds((sts || []).filter((s) => s.frameworkId === fwId));
      } catch {
        /* fallback */
      } finally {
        if (a) setLoading(false);
      }
    })();
    return () => {
      a = false;
    };
  }, [fwId, getComp, getClauses, getStds]);

  const topClauses = clauses.filter((c) => !c.parentId).slice(0, 12);

  return (
    <div>
      <AppPageHeader
        title={`${code} Workspace`}
        description={`${title} — applicable standards, clauses, personnel, projects and live compliance.`}
      >
        <Link
          to="/app/frameworks"
          className="inline-flex h-9 items-center gap-1.5 rounded-md border border-input bg-background px-3 text-sm font-medium text-foreground hover:bg-accent"
        >
          All Frameworks
        </Link>
      </AppPageHeader>

      {loading ? (
        <Card className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" /> Loading workspace…
        </Card>
      ) : (
        <>
          <div className="mb-6 grid gap-4 md:grid-cols-4">
            <Card className="md:col-span-1 flex flex-col items-center justify-center">
              <ComplianceRing pct={result?.overallReadiness ?? 0} size="md" />
              <p className="mt-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Overall Readiness
              </p>
            </Card>
            <Card className="md:col-span-3">
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                <StatCard
                  label="Applicable Clauses"
                  value={result?.totalApplicable ?? 0}
                  tone="text-foreground"
                />
                <StatCard label="Conforming" value={result?.conforming ?? 0} tone="text-success" />
                <StatCard label="Partial" value={result?.partial ?? 0} tone="text-warning" />
                <StatCard
                  label="Nonconforming"
                  value={result?.nonconforming ?? 0}
                  tone="text-destructive"
                />
                <StatCard
                  label="Unassessed"
                  value={result?.unassessed ?? 0}
                  tone="text-muted-foreground"
                />
                <StatCard
                  label="Missing Evidence"
                  value={result?.missingEvidence ?? 0}
                  tone="text-destructive"
                />
                <StatCard
                  label="Expired Evidence"
                  value={result?.expiredEvidence ?? 0}
                  tone="text-destructive"
                />
                <StatCard
                  label="Approved Exclusions"
                  value={result?.approvedExclusions ?? 0}
                  tone="text-info"
                />
              </div>
              <div className="mt-4 grid grid-cols-3 gap-3 border-t border-border pt-4">
                <StatCard
                  label="Evidence Coverage"
                  value={`${result?.evidenceCoverage ?? 0}%`}
                  tone="text-foreground"
                />
                <StatCard
                  label="Assessment Coverage"
                  value={`${result?.assessmentCoverage ?? 0}%`}
                  tone="text-foreground"
                />
                <StatCard
                  label="Assessed Conformity"
                  value={`${result?.assessedConformity ?? 0}%`}
                  tone="text-foreground"
                />
              </div>
            </Card>
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <Card>
              <SectionTitle className="mb-3">Applicable Standards</SectionTitle>
              {stds.length === 0 ? (
                <EmptyState title="No standards" body="" />
              ) : (
                <div className="space-y-2">
                  {stds.map((s) => (
                    <div key={s.id} className="flex items-center justify-between text-sm">
                      <div>
                        <p className="font-medium text-foreground">{s.number}</p>
                        <p className="text-xs text-muted-foreground">{s.title}</p>
                      </div>
                      <Pill
                        tone={
                          s.status === "current"
                            ? "success"
                            : s.status === "transition"
                              ? "warning"
                              : "muted"
                        }
                      >
                        {s.status}
                      </Pill>
                    </div>
                  ))}
                </div>
              )}
            </Card>
            <Card>
              <SectionTitle className="mb-3">Clause Compliance (top-level)</SectionTitle>
              {topClauses.length === 0 ? (
                <EmptyState title="No clauses" body="" />
              ) : (
                <DataTable
                  headers={["Clause", "Title", "Status", "Score"]}
                  rows={topClauses.map((c) => [
                    <span className="font-mono text-xs font-semibold text-foreground">
                      {c.number}
                    </span>,
                    <span className="text-foreground">{c.title}</span>,
                    <Pill
                      tone={
                        c.assessmentStatus === "conforming"
                          ? "success"
                          : c.assessmentStatus === "not_assessed"
                            ? "muted"
                            : "warning"
                      }
                    >
                      {c.assessmentStatus.replace(/_/g, " ")}
                    </Pill>,
                    <span className="font-mono font-semibold text-foreground">
                      {c.complianceScore}%
                    </span>,
                  ])}
                />
              )}
              <Link
                to="/app/conformity/clauses"
                className="mt-3 inline-block text-xs font-medium text-primary hover:underline"
              >
                View all clauses →
              </Link>
            </Card>
          </div>

          <div className="mt-4 grid gap-4 md:grid-cols-4">
            <Link to="/app/conformity/assessments" className="block">
              <Card className="hover:border-primary/40">
                <SectionTitle>Assessments</SectionTitle>
              </Card>
            </Link>
            <Link to="/app/conformity/evidence" className="block">
              <Card className="hover:border-primary/40">
                <SectionTitle>Evidence</SectionTitle>
              </Card>
            </Link>
            <Link to="/app/conformity/matrix" className="block">
              <Card className="hover:border-primary/40">
                <SectionTitle>Module Matrix</SectionTitle>
              </Card>
            </Link>
            <Link to="/app/conformity/transition" className="block">
              <Card className="hover:border-primary/40">
                <SectionTitle>Transitions</SectionTitle>
              </Card>
            </Link>
          </div>
        </>
      )}
    </div>
  );
}
