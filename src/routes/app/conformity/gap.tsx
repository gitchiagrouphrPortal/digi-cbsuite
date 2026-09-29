import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Link } from "@tanstack/react-router";
import { calculateComplianceFn, listClausesFn, listFrameworksFn } from "@/lib/conformity.functions";
import type { ComplianceResult, ClauseDTO, FrameworkDTO } from "@/lib/conformity-schema";
import { AppPageHeader, Card, EmptyState, SectionTitle } from "@/components/app-primitives";
import { StatusPill } from "@/components/conformity-ui";
import { Loader2, AlertTriangle, FileWarning, Clock } from "lucide-react";

export const Route = createFileRoute("/app/conformity/gap")({
  head: () => ({
    meta: [
      { title: "Compliance Gap Analysis — DigiCB" },
      {
        name: "description",
        content:
          "Clauses requiring attention: missing evidence, nonconformities and unassessed items.",
      },
    ],
  }),
  component: Page,
});

import { INITIAL_FRAMEWORKS, INITIAL_COMPLIANCE } from "@/lib/conformity-client-data";

function Page() {
  const calc = useServerFn(calculateComplianceFn);
  const getClauses = useServerFn(listClausesFn);
  const getFws = useServerFn(listFrameworksFn);
  const [result, setResult] = useState<ComplianceResult>(INITIAL_COMPLIANCE.all);
  const [clauses, setClauses] = useState<ClauseDTO[]>([]);
  const [frameworks, setFrameworks] = useState<FrameworkDTO[]>(INITIAL_FRAMEWORKS);
  const [active, setActive] = useState("all");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let a = true;
    (async () => {
      try {
        const [r, c, f] = await Promise.all([calc({ data: {} }), getClauses(), getFws()]);
        if (!a) return;
        if (r) setResult(r);
        if (c) setClauses(c);
        if (f && f.length > 0) setFrameworks(f);
      } catch {
        // fallback to initial
      }
    })();
    return () => {
      a = false;
    };
  }, [calc, getClauses, getFws]);

  if (loading || !result) {
    return (
      <div>
        <AppPageHeader
          title="Compliance Gap Analysis"
          description="Clauses requiring action to reach accreditation readiness."
        />
        <Card className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" /> Analyzing gaps…
        </Card>
      </div>
    );
  }

  const results =
    active === "all"
      ? result.results
      : result.results.filter(
          (r) => clauses.find((c) => c.id === r.clauseId)?.frameworkId === active,
        );

  const gaps = {
    nonconforming: results.filter((r) => r.status === "nonconforming"),
    partial: results.filter((r) => r.status === "partial"),
    evidenceMissing: results.filter(
      (r) =>
        r.status === "evidence_missing" ||
        (!r.hasValidEvidence && r.assessed && r.status !== "not_applicable"),
    ),
    evidenceExpired: results.filter((r) => r.status === "evidence_expired"),
    unassessed: results.filter((r) => r.status === "not_assessed"),
    corrective: results.filter((r) => r.status === "corrective_action_open"),
  };

  return (
    <div>
      <AppPageHeader
        title="Compliance Gap Analysis"
        description="Evidence-based gaps blocking accreditation readiness. Each gap links to its clause assessment."
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

      <div className="grid gap-4 lg:grid-cols-2">
        <GapSection
          icon={<AlertTriangle className="h-4 w-4 text-destructive" />}
          title="Nonconforming Clauses"
          items={gaps.nonconforming}
          clauses={clauses}
          tone="destructive"
        />
        <GapSection
          icon={<FileWarning className="h-4 w-4 text-warning" />}
          title="Partially Conforming"
          items={gaps.partial}
          clauses={clauses}
          tone="warning"
        />
        <GapSection
          icon={<FileWarning className="h-4 w-4 text-warning" />}
          title="Missing Evidence"
          items={gaps.evidenceMissing}
          clauses={clauses}
          tone="warning"
        />
        <GapSection
          icon={<AlertTriangle className="h-4 w-4 text-destructive" />}
          title="Expired Evidence"
          items={gaps.evidenceExpired}
          clauses={clauses}
          tone="destructive"
        />
        <GapSection
          icon={<Clock className="h-4 w-4 text-muted-foreground" />}
          title="Unassessed Clauses"
          items={gaps.unassessed}
          clauses={clauses}
          tone="muted"
        />
        <GapSection
          icon={<AlertTriangle className="h-4 w-4 text-warning" />}
          title="Corrective Actions Open"
          items={gaps.corrective}
          clauses={clauses}
          tone="warning"
        />
      </div>
    </div>
  );
}

function GapSection({
  icon,
  title,
  items,
  clauses,
  tone,
}: {
  icon: React.ReactNode;
  title: string;
  items: ComplianceResult["results"];
  clauses: ClauseDTO[];
  tone: "destructive" | "warning" | "muted";
}) {
  return (
    <Card>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {icon}
          <h3 className="font-display text-sm font-bold text-foreground">{title}</h3>
        </div>
        <span className="font-display text-lg font-bold text-foreground">{items.length}</span>
      </div>
      <div className="mt-3 space-y-2">
        {items.length === 0 ? (
          <p className="py-3 text-center text-xs text-muted-foreground">
            None — no gaps in this category.
          </p>
        ) : (
          items.map((r) => {
            const cl = clauses.find((c) => c.id === r.clauseId);
            return (
              <Link
                key={r.clauseId}
                to="/app/conformity/assessments"
                className="flex items-center justify-between rounded-lg border border-border bg-muted/30 px-3 py-2 hover:bg-muted/50"
              >
                <div>
                  <p className="font-mono text-xs font-semibold text-primary">
                    {cl?.number ?? r.number}
                  </p>
                  <p className="text-xs text-muted-foreground">{cl?.title ?? r.title}</p>
                </div>
                <StatusPill status={r.status} compact />
              </Link>
            );
          })
        )}
      </div>
    </Card>
  );
}
