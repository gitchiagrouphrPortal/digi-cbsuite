import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useEffect, useMemo } from "react";
import { useServerFn } from "@tanstack/react-start";
import { listRecordsFn, generateFrameworkRisksFn } from "@/lib/records.functions";
import { risks } from "@/lib/records-collections-ext";
import {
  AppPageHeader,
  Card,
  SectionTitle,
  DataTable,
  EmptyState,
  exportRowsCSV,
} from "@/components/app-primitives";
import { useAuth } from "@/lib/auth-context";
import { roleHas } from "@/lib/digicb-roles";
import type { RecordDTO } from "@/lib/records-schema";
import { toast } from "sonner";

export const Route = createFileRoute("/app/risks/")({
  head: () => ({
    meta: [
      { title: "Enterprise Risk Dashboard — DigiCB" },
      {
        name: "description",
        content:
          "Risk heatmap, framework breakdown and overdue actions across all accreditation frameworks.",
      },
    ],
  }),
  component: RiskDashboard,
});

const FRAMEWORKS = [
  { id: "17021", label: "ISO/IEC 17021-1" },
  { id: "ps4992", label: "PS 4992 (Halal)" },
  { id: "17024", label: "ISO/IEC 17024" },
  { id: "17065", label: "ISO/IEC 17065" },
];

const LEVEL_COLORS: Record<string, string> = {
  low: "text-emerald-600",
  medium: "text-amber-600",
  high: "text-orange-600",
  extreme: "text-red-600",
};

function RiskDashboard() {
  const { user } = useAuth();
  const perms = user?.permissions ?? [];
  const canManage = roleHas("risks", perms);
  const list = useServerFn(listRecordsFn);
  const generateRisks = useServerFn(generateFrameworkRisksFn);
  const [records, setRecords] = useState<RecordDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);

  const reload = async () => {
    setLoading(true);
    try {
      const res = await list({ data: { collection: "risks", archived: false } });
      setRecords(res.records);
    } catch {
      setRecords([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    reload();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [list]);

  const handleGenerate = async () => {
    setGenerating(true);
    try {
      const res = await generateRisks({ data: {} });
      toast.success(`Generated ${res.added} new risk record(s). ${res.total} total in library.`);
      await reload();
    } catch {
      toast.error("Failed to generate framework risks.");
    } finally {
      setGenerating(false);
    }
  };

  const stats = useMemo(() => {
    const byLevel: Record<string, number> = { low: 0, medium: 0, high: 0, extreme: 0 };
    const byStatus: Record<string, number> = {};
    const byFramework: Record<string, number> = {};
    let overdue = 0;
    const today = new Date();
    for (const r of records) {
      const level = String(r.data?.riskLevel ?? "medium").toLowerCase();
      byLevel[level] = (byLevel[level] ?? 0) + 1;
      byStatus[r.status] = (byStatus[r.status] ?? 0) + 1;
      const fw = String(r.framework ?? r.data?.framework ?? "unknown");
      byFramework[fw] = (byFramework[fw] ?? 0) + 1;
      const target = r.data?.targetDate ? new Date(String(r.data.targetDate)) : null;
      if (target && target < today && r.status !== "closed") overdue++;
    }
    return { byLevel, byStatus, byFramework, overdue, total: records.length };
  }, [records]);

  const topRisks = useMemo(
    () =>
      [...records]
        .sort((a, b) => Number(b.data?.residualScore ?? 0) - Number(a.data?.residualScore ?? 0))
        .slice(0, 8),
    [records],
  );

  if (loading) {
    return (
      <div>
        <AppPageHeader title="Enterprise Risk Dashboard" description="Loading risk data…" />
        <Card>
          <p className="text-sm text-muted-foreground">Loading…</p>
        </Card>
      </div>
    );
  }

  return (
    <div>
      <AppPageHeader
        title="Enterprise Risk Dashboard"
        description="Clause-linked risk register across all four accreditation frameworks with heat map, treatment status and overdue actions."
      >
        {canManage && (
          <>
            <button
              onClick={handleGenerate}
              disabled={generating}
              className="rounded-lg border border-primary bg-primary/10 px-3 py-2 text-sm font-medium text-primary hover:bg-primary/20 disabled:opacity-50"
            >
              {generating ? "Generating…" : "Generate Framework Risks"}
            </button>
            <Link
              to="/app/internal/risks"
              className="rounded-lg bg-primary px-3 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
            >
              + Add Risk
            </Link>
          </>
        )}
        <button
          onClick={() =>
            exportRowsCSV(
              "risk-register.csv",
              records.map((r) => ({
                Number: r.number,
                Title: r.data?.title,
                Framework: r.framework,
                Category: r.data?.category,
                Clause: r.data?.clause,
                "Assessment Score": r.data?.inherentScore,
                "Risk Level": r.data?.riskLevel,
                "Control for Residual": r.data?.controlEffectiveness,
                "Residual Risk": r.data?.residualScore,
                "Risk Treatment": r.data?.treatment,
                Status: r.status,
                Owner: r.data?.owner,
              })),
            )
          }
          className="rounded-lg border border-border px-3 py-2 text-sm font-medium text-foreground hover:bg-muted"
        >
          Export
        </button>
      </AppPageHeader>

      {/* Summary cards */}
      <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
        <Card className="p-4">
          <p className="text-xs text-muted-foreground">Total Risks</p>
          <p className="font-display text-2xl font-bold text-foreground">{stats.total}</p>
        </Card>
        <Card className="p-4">
          <p className="text-xs text-muted-foreground">Extreme</p>
          <p className={`font-display text-2xl font-bold ${LEVEL_COLORS.extreme}`}>
            {stats.byLevel.extreme ?? 0}
          </p>
        </Card>
        <Card className="p-4">
          <p className="text-xs text-muted-foreground">High</p>
          <p className={`font-display text-2xl font-bold ${LEVEL_COLORS.high}`}>
            {stats.byLevel.high ?? 0}
          </p>
        </Card>
        <Card className="p-4">
          <p className="text-xs text-muted-foreground">Medium</p>
          <p className={`font-display text-2xl font-bold ${LEVEL_COLORS.medium}`}>
            {stats.byLevel.medium ?? 0}
          </p>
        </Card>
        <Card className="p-4">
          <p className="text-xs text-muted-foreground">Low</p>
          <p className={`font-display text-2xl font-bold ${LEVEL_COLORS.low}`}>
            {stats.byLevel.low ?? 0}
          </p>
        </Card>
        <Card className="p-4">
          <p className="text-xs text-muted-foreground">Overdue Actions</p>
          <p
            className={`font-display text-2xl font-bold ${stats.overdue > 0 ? "text-red-600" : "text-foreground"}`}
          >
            {stats.overdue}
          </p>
        </Card>
      </div>

      {/* Framework breakdown + heat map */}
      <div className="mb-6 grid gap-4 lg:grid-cols-2">
        <Card>
          <SectionTitle>Risks by Framework</SectionTitle>
          <div className="mt-4 space-y-3">
            {FRAMEWORKS.map((fw) => {
              const count = stats.byFramework[fw.id] ?? 0;
              const pct = stats.total ? (count / stats.total) * 100 : 0;
              return (
                <div key={fw.id}>
                  <div className="flex items-center justify-between text-sm">
                    <Link to="/app/risks/framework" className="text-foreground hover:underline">
                      {fw.label}
                    </Link>
                    <span className="font-medium text-muted-foreground">{count}</span>
                  </div>
                  <div className="mt-1 h-2 overflow-hidden rounded-full bg-muted">
                    <div className="h-full rounded-full bg-primary" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

        <Card>
          <SectionTitle>Risk Heat Map (Likelihood × Impact)</SectionTitle>
          <HeatMap records={records} />
        </Card>
      </div>

      {/* Top risks table */}
      <Card>
        <SectionTitle>Top Residual Risks</SectionTitle>
        {topRisks.length === 0 ? (
          <EmptyState
            title="No risks found"
            description="Risk records will appear here once seeded."
          />
        ) : (
          <div className="mt-4">
            <DataTable
              headers={[
                "Number",
                "Title",
                "Framework",
                "Clause",
                "Assessment Score",
                "Risk Level",
                "Control for Residual",
                "Residual Risk",
                "Risk Treatment",
                "Status",
                "Owner",
              ]}
              rows={topRisks.map((r) => [
                <Link to="/app/internal/risks" className="font-medium text-primary hover:underline">
                  {r.number}
                </Link>,
                <span className="text-sm">{String(r.data?.title ?? "")}</span>,
                <span className="text-sm">{r.framework}</span>,
                <span className="text-sm">{String(r.data?.clause ?? "")}</span>,
                <span className="text-sm font-semibold text-foreground">
                  {String(r.data?.inherentScore ?? "")}
                </span>,
                <span
                  className={`text-sm font-medium ${LEVEL_COLORS[String(r.data?.riskLevel ?? "medium").toLowerCase()] ?? ""}`}
                >
                  {String(r.data?.riskLevel ?? "")}
                </span>,
                <span className="text-sm">{String(r.data?.controlEffectiveness ?? "")}</span>,
                <span className="text-sm font-semibold text-foreground">
                  {String(r.data?.residualScore ?? "")}
                </span>,
                <span className="text-sm">{String(r.data?.treatment ?? "")}</span>,
                <span className="text-sm">{r.status}</span>,
                <span className="text-sm">{String(r.data?.owner ?? "")}</span>,
              ])}
            />
          </div>
        )}
      </Card>
    </div>
  );
}

function HeatMap({ records }: { records: RecordDTO[] }) {
  const grid = useMemo(() => {
    const g: number[][] = Array.from({ length: 5 }, () => Array(5).fill(0));
    for (const r of records) {
      const l = parseInt(String(r.data?.likelihood ?? "0"), 10);
      const i = parseInt(String(r.data?.impact ?? "0"), 10);
      if (l >= 1 && l <= 5 && i >= 1 && i <= 5) g[5 - i][l - 1]++;
    }
    return g;
  }, [records]);

  const cellColor = (val: number, likelihood: number, impact: number) => {
    if (val === 0) return "bg-muted/40";
    const score = likelihood * impact;
    if (score >= 15) return "bg-red-500 text-white";
    if (score >= 9) return "bg-orange-500 text-white";
    if (score >= 5) return "bg-amber-400 text-amber-950";
    return "bg-emerald-400 text-emerald-950";
  };

  return (
    <div className="mt-4">
      <div className="flex items-center gap-2">
        <div className="flex flex-col items-center pr-2">
          <span className="mb-12 -rotate-90 text-xs text-muted-foreground">Impact →</span>
        </div>
        <div>
          <div className="grid grid-cols-5 gap-1">
            {grid.map((row, ri) =>
              row.map((val, ci) => {
                const impact = 5 - ri;
                const likelihood = ci + 1;
                return (
                  <div
                    key={`${ri}-${ci}`}
                    className={`flex h-12 w-16 items-center justify-center rounded text-sm font-medium ${cellColor(val, likelihood, impact)}`}
                    title={`Likelihood ${likelihood}, Impact ${impact}: ${val} risks`}
                  >
                    {val > 0 ? val : ""}
                  </div>
                );
              }),
            )}
          </div>
          <p className="mt-2 text-center text-xs text-muted-foreground">Likelihood →</p>
        </div>
      </div>
    </div>
  );
}
