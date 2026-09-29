import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useEffect, useMemo } from "react";
import { useServerFn } from "@tanstack/react-start";
import { listRecordsFn } from "@/lib/records.functions";
import {
  AppPageHeader,
  Card,
  SectionTitle,
  DataTable,
  EmptyState,
  exportRowsCSV,
} from "@/components/app-primitives";
import type { RecordDTO } from "@/lib/records-schema";

export const Route = createFileRoute("/app/risks/reports")({
  head: () => ({ meta: [{ title: "Risk Reports — DigiCB" }] }),
  component: RiskReports,
});

const FRAMEWORKS = [
  { id: "17021", label: "ISO/IEC 17021-1" },
  { id: "ps4992", label: "PS 4992 (Halal)" },
  { id: "17024", label: "ISO/IEC 17024" },
  { id: "17065", label: "ISO/IEC 17065" },
];

function RiskReports() {
  const list = useServerFn(listRecordsFn);
  const [records, setRecords] = useState<RecordDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [fwFilter, setFwFilter] = useState("");

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const res = await list({ data: { collection: "risks", archived: false } });
        setRecords(res.records);
      } catch {
        setRecords([]);
      } finally {
        setLoading(false);
      }
    })();
  }, [list]);

  const filtered = useMemo(
    () =>
      records.filter(
        (r) => !fwFilter || String(r.framework ?? r.data?.framework ?? "") === fwFilter,
      ),
    [records, fwFilter],
  );

  const byCategory = useMemo(() => {
    const g: Record<string, number> = {};
    for (const r of filtered) {
      const c = String(r.data?.category ?? "uncategorized");
      g[c] = (g[c] ?? 0) + 1;
    }
    return Object.entries(g).sort((a, b) => b[1] - a[1]);
  }, [filtered]);

  const byStatus = useMemo(() => {
    const g: Record<string, number> = {};
    for (const r of filtered) g[r.status] = (g[r.status] ?? 0) + 1;
    return Object.entries(g);
  }, [filtered]);

  return (
    <div>
      <AppPageHeader
        title="Risk Reports"
        description="Aggregated risk analysis by framework, category and treatment status with CSV export."
      >
        <select
          value={fwFilter}
          onChange={(e) => setFwFilter(e.target.value)}
          className="rounded-md border border-input bg-background px-3 py-2 text-sm"
        >
          <option value="">All frameworks</option>
          {FRAMEWORKS.map((f) => (
            <option key={f.id} value={f.id}>
              {f.label}
            </option>
          ))}
        </select>
        <button
          onClick={() =>
            exportRowsCSV(
              "risk-report.csv",
              filtered.map((r) => ({
                Number: r.number,
                Title: r.data?.title,
                Framework: r.framework,
                Category: r.data?.category,
                Standard: r.data?.standard,
                Clause: r.data?.clause,
                Module: r.data?.module,
                Level: r.data?.riskLevel,
                Inherent: r.data?.inherentScore,
                Residual: r.data?.residualScore,
                Status: r.status,
                Owner: r.data?.owner,
                Treatment: r.data?.treatment,
                Target: r.data?.targetDate,
              })),
            )
          }
          className="rounded-lg border border-border px-3 py-2 text-sm font-medium text-foreground hover:bg-muted"
        >
          Export CSV
        </button>
      </AppPageHeader>

      {loading ? (
        <Card>
          <p className="text-sm text-muted-foreground">Loading…</p>
        </Card>
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          <Card>
            <SectionTitle>Risks by Category</SectionTitle>
            {byCategory.length === 0 ? (
              <EmptyState title="No data" description="No risks in this view." />
            ) : (
              <div className="mt-4">
                <DataTable
                  headers={["Category", "Count"]}
                  rows={byCategory.map(([cat, count]) => [
                    <span className="text-sm capitalize">{cat.replace(/_/g, " ")}</span>,
                    <span className="text-sm font-medium">{count}</span>,
                  ])}
                />
              </div>
            )}
          </Card>
          <Card>
            <SectionTitle>Risks by Treatment Status</SectionTitle>
            {byStatus.length === 0 ? (
              <EmptyState title="No data" description="No risks in this view." />
            ) : (
              <div className="mt-4">
                <DataTable
                  headers={["Status", "Count"]}
                  rows={byStatus.map(([status, count]) => [
                    <span className="text-sm capitalize">{status}</span>,
                    <span className="text-sm font-medium">{count}</span>,
                  ])}
                />
              </div>
            )}
          </Card>
        </div>
      )}

      <Card className="mt-4">
        <SectionTitle>Full Risk Register ({filtered.length})</SectionTitle>
        <div className="mt-3">
          <DataTable
            headers={[
              "Number",
              "Title",
              "Framework",
              "Category",
              "Clause",
              "Level",
              "Status",
              "Owner",
            ]}
            rows={filtered.map((r) => [
              <Link to="/app/internal/risks" className="font-medium text-primary hover:underline">
                {r.number}
              </Link>,
              <span className="text-sm">{String(r.data?.title ?? "")}</span>,
              <span className="text-sm">{r.framework}</span>,
              <span className="text-sm capitalize">
                {String(r.data?.category ?? "").replace(/_/g, " ")}
              </span>,
              <span className="text-sm">{String(r.data?.clause ?? "")}</span>,
              <span className="text-sm">{String(r.data?.riskLevel ?? "")}</span>,
              <span className="text-sm">{r.status}</span>,
              <span className="text-sm">{String(r.data?.owner ?? "")}</span>,
            ])}
          />
        </div>
      </Card>
    </div>
  );
}
