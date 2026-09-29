import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Link } from "@tanstack/react-router";
import {
  calculateComplianceFn,
  listClausesFn,
  listFrameworksFn,
  listStandardsFn,
  listEvidenceFn,
} from "@/lib/conformity.functions";
import type {
  ComplianceResult,
  ClauseDTO,
  FrameworkDTO,
  StandardDTO,
  EvidenceDTO,
} from "@/lib/conformity-schema";
import { AppPageHeader, Card, SectionTitle, EmptyState } from "@/components/app-primitives";
import { ComplianceRing, StatusPill, ComplianceBadge } from "@/components/conformity-ui";
import { Download, FileText } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/app/conformity/reports")({
  head: () => ({
    meta: [
      { title: "Conformity Reports — DigiCB" },
      {
        name: "description",
        content:
          "Clause-wise compliance, readiness and gap reports with formula and evidence references.",
      },
    ],
  }),
  component: Page,
});

const REPORTS = [
  {
    id: "clause",
    label: "Clause-wise Compliance Report",
    desc: "Per-clause status, score and evidence",
  },
  {
    id: "readiness",
    label: "Framework Readiness Report",
    desc: "Readiness % by framework with methodology",
  },
  { id: "mapping", label: "Module-Clause Mapping Report", desc: "Module to clause traceability" },
  { id: "evidence", label: "Evidence Coverage Report", desc: "Evidence validity and coverage" },
  { id: "missing", label: "Missing Evidence Report", desc: "Clauses lacking valid evidence" },
  { id: "expired", label: "Expired Evidence Report", desc: "Evidence past expiry" },
  { id: "ncr", label: "Nonconformity by Clause Report", desc: "NCRs grouped by clause" },
  {
    id: "cross",
    label: "Cross-Framework Mapping Report",
    desc: "Shared evidence across frameworks",
  },
  { id: "trend", label: "Compliance Trend Report", desc: "Historical compliance snapshots" },
];

function Page() {
  const calc = useServerFn(calculateComplianceFn);
  const getClauses = useServerFn(listClausesFn);
  const getFws = useServerFn(listFrameworksFn);
  const getStds = useServerFn(listStandardsFn);
  const getEvidence = useServerFn(listEvidenceFn);
  const [result, setResult] = useState<ComplianceResult | null>(null);
  const [clauses, setClauses] = useState<ClauseDTO[]>([]);
  const [frameworks, setFrameworks] = useState<FrameworkDTO[]>([]);
  const [standards, setStandards] = useState<StandardDTO[]>([]);
  const [evidence, setEvidence] = useState<EvidenceDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [active, setActive] = useState<string | null>(null);

  useEffect(() => {
    let a = true;
    (async () => {
      setLoading(true);
      try {
        const [r, c, f, s, e] = await Promise.all([
          calc({ data: {} }),
          getClauses(),
          getFws(),
          getStds(),
          getEvidence(),
        ]);
        if (!a) return;
        setResult(r);
        setClauses(c);
        setFrameworks(f);
        setStandards(s);
        setEvidence(e);
      } catch {
        /* keep empty state */
      } finally {
        if (a) setLoading(false);
      }
    })();
    return () => {
      a = false;
    };
  }, [calc, getClauses, getFws, getStds, getEvidence]);

  const exportReport = (id: string) => {
    if (!result) return;
    let csv = "";
    const stamp = `DigiCB Conformity Report — ${REPORTS.find((r) => r.id === id)?.label}\nGenerated: ${new Date().toISOString()}\nSystem-generated — subject to authorized review\n\n`;
    if (id === "clause" || id === "ncr" || id === "missing" || id === "expired") {
      csv =
        stamp +
        ["Clause", "Title", "Framework", "Status", "Score", "Evidence Valid", "Last Assessed"].join(
          ",",
        ) +
        "\n" +
        result.results
          .map((r) => {
            const cl = clauses.find((c) => c.id === r.clauseId);
            const fw = frameworks.find((f) => f.id === cl?.frameworkId);
            return [
              cl?.number,
              cl?.title,
              fw?.label,
              r.status,
              r.score,
              r.hasValidEvidence,
              cl?.lastAssessed,
            ]
              .map((v) => `"${String(v ?? "").replace(/"/g, '""')}"`)
              .join(",");
          })
          .join("\n");
    } else if (id === "readiness") {
      csv =
        stamp +
        [
          "Framework",
          "Overall Readiness",
          "Evidence Coverage",
          "Assessment Coverage",
          "Assessed Conformity",
          "Conforming",
          "Partial",
          "Nonconforming",
          "Unassessed",
        ].join(",") +
        "\n" +
        frameworks.map((f) => `"${f.label}","calc pending"`).join("\n");
    } else if (id === "evidence") {
      csv =
        stamp +
        ["Evidence", "Type", "Source", "Clauses", "Validity", "Approval", "Expiry"].join(",") +
        "\n" +
        evidence
          .map((e) =>
            [
              e.title,
              e.evidenceType,
              e.sourceModule,
              e.clauseIds.map((cid) => clauses.find((c) => c.id === cid)?.number).join("; "),
              e.validity,
              e.approvalStatus,
              e.expiryDate,
            ]
              .map((v) => `"${String(v ?? "").replace(/"/g, '""')}"`)
              .join(","),
          )
          .join("\n");
    } else {
      csv = stamp + "See Conformity Reference Matrix for full mapping data.";
    }
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${id}-report.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Report exported");
  };

  if (loading || !result) {
    return (
      <div>
        <AppPageHeader
          title="Conformity Reports"
          description="Clause-wise compliance, readiness and gap reports."
        />
        <Card>
          <p className="py-6 text-center text-sm text-muted-foreground">Loading…</p>
        </Card>
      </div>
    );
  }

  return (
    <div>
      <AppPageHeader
        title="Conformity Reports"
        description="Every report includes the calculation formula, supporting evidence references and a system-generated notice."
      />

      <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="flex flex-col items-center justify-center">
          <ComplianceRing pct={result.overallReadiness} label="Overall Readiness" size="sm" />
        </Card>
        <Card>
          <SectionTitle>Methodology</SectionTitle>
          <p className="mt-2 text-xs text-muted-foreground">
            Overall Readiness = Σ earned points ÷ Σ max points × 100. Unassessed applicable clauses
            remain in the denominator.
          </p>
        </Card>
        <Card>
          <SectionTitle>Evidence</SectionTitle>
          <p className="mt-2 text-xs text-muted-foreground">
            Coverage = clauses with valid approved evidence ÷ total applicable. Missing/expired
            evidence reduces live status.
          </p>
        </Card>
        <Card>
          <SectionTitle>Assessed</SectionTitle>
          <p className="mt-2 text-xs text-muted-foreground">
            Conformity = earned assessed points ÷ max assessed points. Not a claim of overall
            compliance.
          </p>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {REPORTS.map((r) => (
          <Card key={r.id}>
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary" />
                <div>
                  <h3 className="font-display text-sm font-bold text-foreground">{r.label}</h3>
                  <p className="text-xs text-muted-foreground">{r.desc}</p>
                </div>
              </div>
            </div>
            <div className="mt-4 flex gap-2">
              <button
                onClick={() => setActive(r.id)}
                className="rounded-md border border-input px-3 py-1.5 text-xs font-medium text-foreground hover:bg-accent"
              >
                Preview
              </button>
              <button
                onClick={() => exportReport(r.id)}
                className="inline-flex items-center gap-1 rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground hover:bg-primary/90"
              >
                <Download className="h-3 w-3" /> Export
              </button>
            </div>
          </Card>
        ))}
      </div>

      {active && (
        <Card className="mt-6">
          <div className="flex items-center justify-between">
            <SectionTitle>{REPORTS.find((r) => r.id === active)?.label}</SectionTitle>
            <button
              onClick={() => exportReport(active)}
              className="inline-flex items-center gap-1 rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground hover:bg-primary/90"
            >
              <Download className="h-3 w-3" /> Export
            </button>
          </div>
          <p className="mt-2 rounded-md bg-muted/50 px-3 py-2 text-[11px] text-muted-foreground">
            System-generated — subject to authorized review. Generated {new Date().toLocaleString()}
            . Methodology: Overall Readiness % = Earned points ÷ Maximum points × 100 (unassessed
            applicable clauses included in denominator).
          </p>
          <div className="mt-3 max-h-[400px] overflow-y-auto">
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
                {result.results.map((r) => {
                  const cl = clauses.find((c) => c.id === r.clauseId);
                  return (
                    <tr key={r.clauseId} className="border-b border-border/60">
                      <td className="px-3 py-2 font-mono text-xs text-primary">{cl?.number}</td>
                      <td className="px-3 py-2 text-xs text-foreground">{cl?.title}</td>
                      <td className="px-3 py-2">
                        <StatusPill status={r.status} compact />
                      </td>
                      <td className="px-3 py-2">
                        <ComplianceBadge pct={r.score} />
                      </td>
                      <td className="px-3 py-2 text-xs">{r.hasValidEvidence ? "valid" : "—"}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
}
