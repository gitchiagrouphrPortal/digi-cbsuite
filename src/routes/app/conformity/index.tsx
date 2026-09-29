import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Link } from "@tanstack/react-router";
import {
  calculateAllComplianceFn,
  listFrameworksFn,
  listReassessmentRemindersFn,
  regenerateConformityFn,
  validateConformityFn,
} from "@/lib/conformity.functions";
import type { ComplianceResult, ReassessmentReminder } from "@/lib/conformity-schema";
import { AppPageHeader, Card, SectionTitle, EmptyState } from "@/components/app-primitives";
import {
  ComplianceRing,
  ComplianceBar,
  StatCard,
  StatusPill,
  FrameworkTabs,
  ClauseLink,
} from "@/components/conformity-ui";
import { Loader2, AlertTriangle, FileWarning, CheckCircle2, Clock, BellRing } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/app/conformity/")({
  head: () => ({
    meta: [
      { title: "Conformity Dashboard — DigiCB" },
      {
        name: "description",
        content: "Live accreditation compliance calculated from clause assessments and evidence.",
      },
    ],
  }),
  component: Page,
});

import { INITIAL_FRAMEWORKS, INITIAL_COMPLIANCE } from "@/lib/conformity-client-data";

function Page() {
  const calcAll = useServerFn(calculateAllComplianceFn);
  const getFws = useServerFn(listFrameworksFn);
  const getReminders = useServerFn(listReassessmentRemindersFn);
  const regenerate = useServerFn(regenerateConformityFn);
  const validate = useServerFn(validateConformityFn);
  const [result, setResult] = useState<ComplianceResult>(INITIAL_COMPLIANCE.all);
  const [frameworks, setFrameworks] = useState<{ id: string; label: string }[]>(
    INITIAL_FRAMEWORKS.map((f) => ({ id: f.id, label: f.label })),
  );
  const [fwResults, setFwResults] = useState<Record<string, ComplianceResult>>({
    fw_17021: INITIAL_COMPLIANCE.fw_17021,
    fw_ps4992: INITIAL_COMPLIANCE.fw_ps4992,
    fw_17024: INITIAL_COMPLIANCE.fw_17024,
    fw_17065: INITIAL_COMPLIANCE.fw_17065,
  });
  const [reminders, setReminders] = useState<ReassessmentReminder[]>([]);
  const [active, setActive] = useState("all");
  const [loading, setLoading] = useState(false);
  const [busy, setBusy] = useState(false);
  const [validation, setValidation] = useState<null | {
    totalFrameworks: number;
    totalStandards: number;
    clausesPerFramework: Record<string, number>;
    mappingsPerFramework: Record<string, number>;
    missingMappings: number;
    orphanClauses: number;
    insufficientDataFrameworks: string[];
  }>(null);

  const reloadAll = async () => {
    try {
      const [fws, all, rems] = await Promise.all([getFws(), calcAll(), getReminders()]);
      if (fws && fws.length > 0) {
        setFrameworks(fws.map((f) => ({ id: f.id, label: f.label })));
      }
      if (all) {
        setResult(all.all);
        setFwResults(all.perFramework);
      }
      if (rems) setReminders(rems);
    } catch {
      // preserve fast initial data
    }
  };

  useEffect(() => {
    let active_ = true;
    (async () => {
      await reloadAll();
      if (!active_) return;
    })();
    return () => {
      active_ = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [calcAll, getFws, getReminders]);

  const handleGenerate = async () => {
    setBusy(true);
    try {
      const res = await regenerate({ data: {} });
      toast.success(
        `Added ${res.addedClauses} clauses, ${res.addedMappings} mappings, ${res.addedEvidence} evidence, ${res.addedAssessments} assessments.`,
      );
      await reloadAll();
    } catch {
      toast.error("Failed to generate clause library data.");
    } finally {
      setBusy(false);
    }
  };

  const handleValidate = async () => {
    setBusy(true);
    try {
      const res = await validate({ data: {} });
      setValidation(res);
      if (res.insufficientDataFrameworks.length === 0 && res.missingMappings === 0) {
        toast.success("All frameworks have clauses, mappings and assessments.");
      } else {
        toast.warning(
          `${res.insufficientDataFrameworks.length} framework(s) with insufficient data, ${res.missingMappings} missing mappings.`,
        );
      }
    } catch {
      toast.error("Validation failed.");
    } finally {
      setBusy(false);
    }
  };

  if (loading || !result) {
    return (
      <div>
        <AppPageHeader
          title="Conformity Dashboard"
          description="Live accreditation compliance — calculated from clause assessments and evidence, never manually entered."
        />
        <Card className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" /> Calculating compliance from assessments…
        </Card>
      </div>
    );
  }

  const shown = active === "all" ? result : (fwResults[active] ?? result);
  const drillResults = shown.results
    .filter((r) => r.status !== "conforming" || !r.hasValidEvidence)
    .slice(0, 12);

  return (
    <div>
      <AppPageHeader
        title="Conformity Dashboard"
        description="Live accreditation compliance — calculated from clause assessments and evidence, never manually entered."
      >
        <button
          onClick={handleValidate}
          disabled={busy}
          className="inline-flex h-9 items-center gap-1.5 rounded-md border border-input bg-background px-3 text-sm font-medium text-foreground hover:bg-accent disabled:opacity-50"
        >
          Validate Completeness
        </button>
        <button
          onClick={handleGenerate}
          disabled={busy}
          className="inline-flex h-9 items-center gap-1.5 rounded-md border border-primary bg-primary/10 px-3 text-sm font-medium text-primary hover:bg-primary/20 disabled:opacity-50"
        >
          {busy ? "Working…" : "Generate Clause Library"}
        </button>
        <Link
          to="/app/conformity/reports"
          className="inline-flex h-9 items-center gap-1.5 rounded-md border border-input bg-background px-3 text-sm font-medium text-foreground hover:bg-accent"
        >
          Reports
        </Link>
      </AppPageHeader>

      {validation && (
        <Card className="mb-6 border-l-4 border-l-info">
          <SectionTitle>Clause Completeness Validation</SectionTitle>
          <div className="mt-3 grid grid-cols-2 gap-3 text-sm sm:grid-cols-4 lg:grid-cols-6">
            <div>
              <p className="text-xs text-muted-foreground">Frameworks</p>
              <p className="font-semibold">{validation.totalFrameworks}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Standards</p>
              <p className="font-semibold">{validation.totalStandards}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Missing Mappings</p>
              <p
                className={`font-semibold ${validation.missingMappings > 0 ? "text-warning" : "text-success"}`}
              >
                {validation.missingMappings}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Orphan Clauses</p>
              <p
                className={`font-semibold ${validation.orphanClauses > 0 ? "text-warning" : "text-success"}`}
              >
                {validation.orphanClauses}
              </p>
            </div>
            <div className="col-span-2">
              <p className="text-xs text-muted-foreground">Clauses per Framework</p>
              <p className="font-semibold">
                {Object.entries(validation.clausesPerFramework)
                  .map(([k, v]) => `${k.replace("fw_", "")}: ${v}`)
                  .join("  ·  ") || "—"}
              </p>
            </div>
          </div>
          {validation.insufficientDataFrameworks.length > 0 && (
            <p className="mt-3 text-sm text-warning">
              <AlertTriangle className="mr-1 inline h-4 w-4" />
              Frameworks with insufficient data: {validation.insufficientDataFrameworks.join(", ")}
            </p>
          )}
        </Card>
      )}

      <FrameworkTabs active={active} onChange={setActive} />

      <div className="mb-6 grid gap-4 lg:grid-cols-4">
        <Card className="flex flex-col items-center justify-center">
          <ComplianceRing
            pct={shown.overallReadiness}
            label="Overall Readiness"
            sub={`${shown.totalApplicable} applicable clauses`}
          />
        </Card>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:col-span-3">
          <StatCard
            label="Evidence Coverage"
            value={`${shown.evidenceCoverage}%`}
            tone="text-info"
            hint="Applicable clauses with valid approved evidence"
          />
          <StatCard
            label="Assessment Coverage"
            value={`${shown.assessmentCoverage}%`}
            tone="text-info"
            hint="Applicable clauses formally assessed"
          />
          <StatCard
            label="Assessed Conformity"
            value={`${shown.assessedConformity}%`}
            tone="text-success"
            hint="Conformity among assessed clauses only"
          />
          <StatCard
            label="Approved Exclusions"
            value={shown.approvedExclusions}
            tone="text-info"
            hint="Not Applicable with approval"
          />
          <StatCard label="Conforming" value={shown.conforming} tone="text-success" />
          <StatCard label="Partially Conforming" value={shown.partial} tone="text-warning" />
          <StatCard label="Nonconforming" value={shown.nonconforming} tone="text-destructive" />
          <StatCard
            label="Unassessed"
            value={shown.unassessed}
            tone="text-muted-foreground"
            hint="Reduces overall readiness"
          />
        </div>
      </div>

      {active === "all" && (
        <Card className="mb-6">
          <SectionTitle>Compliance by Framework</SectionTitle>
          <div className="mt-4 space-y-4">
            {frameworks.map((f) => {
              const r = fwResults[f.id];
              if (!r) return null;
              return (
                <Link key={f.id} to="/app/conformity/status" className="block">
                  <ComplianceBar
                    pct={r.overallReadiness}
                    label={`${f.label} — ${r.conforming}/${r.totalApplicable} conforming`}
                  />
                </Link>
              );
            })}
          </div>
        </Card>
      )}

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <SectionTitle>Attention Required — Drill-down</SectionTitle>
          <p className="mt-1 text-xs text-muted-foreground">
            Select a clause to view its assessment and evidence.
          </p>
          <div className="mt-3 space-y-2">
            {drillResults.length === 0 ? (
              <EmptyState
                title="All assessed clauses conform"
                body="No clauses require attention in this view."
              />
            ) : (
              drillResults.map((r) => (
                <div
                  key={r.clauseId}
                  className="flex items-center justify-between rounded-lg border border-border bg-muted/30 px-3 py-2"
                >
                  <div className="flex items-center gap-2">
                    <ClauseLink clauseId={r.clauseId} number={r.number} />
                    <span className="max-w-[200px] truncate text-xs text-muted-foreground">
                      {r.title}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    {!r.hasValidEvidence && r.assessed && (
                      <FileWarning className="h-3.5 w-3.5 text-warning" />
                    )}
                    <StatusPill status={r.status} />
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>

        <Card>
          <SectionTitle>Risk Indicators</SectionTitle>
          <div className="mt-3 space-y-3">
            <RiskRow
              icon={<AlertTriangle className="h-4 w-4 text-destructive" />}
              label="Missing / expired evidence"
              value={shown.missingEvidence + shown.expiredEvidence}
              to="/app/conformity/gap"
            />
            <RiskRow
              icon={<Clock className="h-4 w-4 text-warning" />}
              label="Unassessed applicable clauses"
              value={shown.unassessed}
              to="/app/conformity/assessments"
            />
            <RiskRow
              icon={<FileWarning className="h-4 w-4 text-warning" />}
              label="Partially conforming"
              value={shown.partial}
              to="/app/conformity/assessments"
            />
            <RiskRow
              icon={<CheckCircle2 className="h-4 w-4 text-success" />}
              label="Conforming clauses"
              value={shown.conforming}
              to="/app/conformity/status"
            />
          </div>
          <p className="mt-4 rounded-md bg-muted/50 px-3 py-2 text-[11px] text-muted-foreground">
            System-generated — subject to authorized review. Percentages are calculated live from
            clause assessments and approved evidence; unassessed applicable clauses remain in the
            denominator so incomplete assessments never inflate readiness.
          </p>
        </Card>
      </div>

      {reminders.length > 0 && (
        <Card className="mt-4">
          <div className="flex items-center justify-between">
            <SectionTitle>Reassessment Reminders</SectionTitle>
            <Link
              to="/app/conformity/reminders"
              className="text-xs font-medium text-primary hover:underline"
            >
              View all →
            </Link>
          </div>
          <p className="mt-1 text-xs text-muted-foreground">
            Automated alerts for expiring evidence, transitional ISO standards and upcoming clause
            reassessments — also delivered to your notification feed.
          </p>
          <div className="mt-3 space-y-2">
            {reminders.slice(0, 5).map((r) => (
              <Link
                key={r.id}
                to={r.link}
                className="flex items-center justify-between rounded-lg border border-border bg-muted/30 px-3 py-2 hover:bg-muted/50"
              >
                <div className="flex min-w-0 items-center gap-2">
                  <BellRing
                    className={`h-4 w-4 shrink-0 ${
                      r.severity === "critical"
                        ? "text-destructive"
                        : r.severity === "warning"
                          ? "text-warning"
                          : "text-info"
                    }`}
                  />
                  <span className="truncate text-sm text-foreground">{r.title}</span>
                </div>
                <span
                  className={`shrink-0 text-xs font-semibold ${
                    r.daysLeft === null || r.daysLeft < 0
                      ? "text-destructive"
                      : r.daysLeft < 30
                        ? "text-warning"
                        : "text-muted-foreground"
                  }`}
                >
                  {r.daysLeft === null
                    ? "—"
                    : r.daysLeft < 0
                      ? `${Math.abs(r.daysLeft)}d overdue`
                      : `${r.daysLeft}d`}
                </span>
              </Link>
            ))}
            {reminders.length > 5 && (
              <p className="pt-1 text-center text-xs text-muted-foreground">
                +{reminders.length - 5} more reminders
              </p>
            )}
          </div>
        </Card>
      )}
    </div>
  );
}

function RiskRow({
  icon,
  label,
  value,
  to,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  to: string;
}) {
  return (
    <Link
      to={to}
      className="flex items-center justify-between rounded-lg border border-border px-3 py-2.5 hover:bg-muted/40"
    >
      <div className="flex items-center gap-2">
        {icon}
        <span className="text-sm text-foreground">{label}</span>
      </div>
      <span className="font-display text-lg font-bold text-foreground">{value}</span>
    </Link>
  );
}
