// DigiCB Risk Management — filtered risk view component.
// Loads all risks then filters client-side by category/framework/overdue.
import { useState, useEffect, useMemo } from "react";
import { Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { listRecordsFn } from "@/lib/records.functions";
import { risks } from "@/lib/records-collections-ext";
import {
  AppPageHeader,
  Card,
  DataTable,
  EmptyState,
  exportRowsCSV,
} from "@/components/app-primitives";
import type { RecordDTO } from "@/lib/records-schema";

interface Props {
  title: string;
  description: string;
  category?: string;
  framework?: string;
  overdueOnly?: boolean;
}

const LEVEL_COLORS: Record<string, string> = {
  low: "text-emerald-600",
  medium: "text-amber-600",
  high: "text-orange-600",
  extreme: "text-red-600",
};

export function FilteredRiskView({ title, description, category, framework, overdueOnly }: Props) {
  const list = useServerFn(listRecordsFn);
  const [records, setRecords] = useState<RecordDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

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

  const filtered = useMemo(() => {
    const today = new Date();
    return records.filter((r) => {
      if (category && String(r.data?.category ?? "") !== category) return false;
      if (framework && String(r.framework ?? r.data?.framework ?? "") !== framework) return false;
      if (overdueOnly) {
        const target = r.data?.targetDate ? new Date(String(r.data.targetDate)) : null;
        if (!target || target >= today || r.status === "closed") return false;
      }
      if (search) {
        const hay =
          `${r.number} ${r.data?.title ?? ""} ${r.data?.clause ?? ""} ${r.data?.owner ?? ""}`.toLowerCase();
        if (!hay.includes(search.toLowerCase())) return false;
      }
      return true;
    });
  }, [records, category, framework, overdueOnly, search]);

  return (
    <div>
      <AppPageHeader title={title} description={description}>
        <Link
          to="/app/internal/risks"
          className="rounded-lg bg-primary px-3 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
        >
          + Add Risk
        </Link>
        <button
          onClick={() =>
            exportRowsCSV(
              "risks-filtered.csv",
              filtered.map((r) => ({
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
                Target: r.data?.targetDate,
              })),
            )
          }
          className="rounded-lg border border-border px-3 py-2 text-sm font-medium text-foreground hover:bg-muted"
        >
          Export
        </button>
      </AppPageHeader>

      <div className="mb-4">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search risks…"
          className="w-full max-w-md rounded-md border border-input bg-background py-2 px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
        />
      </div>

      {loading ? (
        <Card>
          <p className="text-sm text-muted-foreground">Loading…</p>
        </Card>
      ) : filtered.length === 0 ? (
        <EmptyState title="No risks found" description="Adjust filters or add a new risk record." />
      ) : (
        <Card>
          <p className="mb-3 text-sm text-muted-foreground">{filtered.length} risk(s) matched</p>
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
              "Target",
            ]}
            rows={filtered.map((r) => [
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
              <span className="text-sm">{String(r.data?.targetDate ?? "")}</span>,
            ])}
          />
        </Card>
      )}
    </div>
  );
}
