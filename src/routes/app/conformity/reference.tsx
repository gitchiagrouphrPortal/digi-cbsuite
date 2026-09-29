import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Link } from "@tanstack/react-router";
import {
  listClausesFn,
  listModuleMappingsFn,
  listEvidenceFn,
  listFrameworksFn,
  listStandardsFn,
} from "@/lib/conformity.functions";
import type {
  ClauseDTO,
  ModuleMappingDTO,
  EvidenceDTO,
  FrameworkDTO,
  StandardDTO,
} from "@/lib/conformity-schema";
import { AppPageHeader, Card, EmptyState } from "@/components/app-primitives";
import { StatusPill, ComplianceBadge } from "@/components/conformity-ui";
import { Search, Download } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/app/conformity/reference")({
  head: () => ({
    meta: [
      { title: "Conformity Reference Matrix — DigiCB" },
      {
        name: "description",
        content: "Full traceability matrix: clause, module, evidence, assessment and compliance.",
      },
    ],
  }),
  component: Page,
});

function Page() {
  const getClauses = useServerFn(listClausesFn);
  const getMappings = useServerFn(listModuleMappingsFn);
  const getEvidence = useServerFn(listEvidenceFn);
  const getFws = useServerFn(listFrameworksFn);
  const getStds = useServerFn(listStandardsFn);
  const [clauses, setClauses] = useState<ClauseDTO[]>([]);
  const [mappings, setMappings] = useState<ModuleMappingDTO[]>([]);
  const [evidence, setEvidence] = useState<EvidenceDTO[]>([]);
  const [frameworks, setFrameworks] = useState<FrameworkDTO[]>([]);
  const [standards, setStandards] = useState<StandardDTO[]>([]);
  const [fwFilter, setFwFilter] = useState("all");
  const [moduleFilter, setModuleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let a = true;
    (async () => {
      setLoading(true);
      try {
        const [c, m, e, f, s] = await Promise.all([
          getClauses(),
          getMappings(),
          getEvidence(),
          getFws(),
          getStds(),
        ]);
        if (!a) return;
        setClauses(c);
        setMappings(m);
        setEvidence(e);
        setFrameworks(f);
        setStandards(s);
      } catch {
        /* keep empty state */
      } finally {
        if (a) setLoading(false);
      }
    })();
    return () => {
      a = false;
    };
  }, [getClauses, getMappings, getEvidence, getFws, getStds]);

  const modules = useMemo(
    () => Array.from(new Set(mappings.map((m) => m.module))).sort(),
    [mappings],
  );

  const rows = useMemo(() => {
    return clauses
      .filter((c) => fwFilter === "all" || c.frameworkId === fwFilter)
      .filter((c) => statusFilter === "all" || c.assessmentStatus === statusFilter)
      .map((c) => {
        const std = standards.find((s) => s.id === c.standardId);
        const fw = frameworks.find((f) => f.id === c.frameworkId);
        const maps = mappings.filter((m) => m.clauseId === c.id);
        const ev = evidence.filter((e) => e.clauseIds.includes(c.id));
        return { clause: c, std, fw, maps, ev };
      })
      .filter((r) => {
        if (moduleFilter !== "all" && !r.maps.some((m) => m.module === moduleFilter)) return false;
        if (query.trim()) {
          const q = query.toLowerCase();
          return (
            r.clause.number.toLowerCase().includes(q) || r.clause.title.toLowerCase().includes(q)
          );
        }
        return true;
      });
  }, [
    clauses,
    standards,
    frameworks,
    mappings,
    evidence,
    fwFilter,
    moduleFilter,
    statusFilter,
    query,
  ]);

  const exportCsv = () => {
    const header = [
      "Framework",
      "Standard",
      "Clause",
      "Title",
      "Applicability",
      "Module",
      "Submodule",
      "Evidence",
      "Status",
      "Compliance",
      "Last Assessed",
    ];
    const lines = rows.map((r) =>
      [
        r.fw?.label ?? "",
        r.std?.number ?? "",
        r.clause.number,
        r.clause.title,
        r.clause.applicability ?? "",
        r.maps.map((m) => m.module).join("; "),
        r.maps.map((m) => m.submodule).join("; "),
        r.ev.map((e) => e.title).join("; "),
        r.clause.assessmentStatus,
        r.clause.complianceScore,
        r.clause.lastAssessed ?? "",
      ]
        .map((v) => `"${String(v).replace(/"/g, '""')}"`)
        .join(","),
    );
    const csv = [header.join(","), ...lines].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "conformity-reference-matrix.csv";
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Matrix exported as CSV");
  };

  return (
    <div>
      <AppPageHeader
        title="Conformity Reference Matrix"
        description="Full bidirectional traceability: clause → module → evidence → assessment → compliance. Exportable."
      >
        <button
          onClick={exportCsv}
          className="inline-flex h-9 items-center gap-1.5 rounded-md border border-input bg-background px-3 text-sm font-medium text-foreground hover:bg-accent"
        >
          <Download className="h-4 w-4" /> Export CSV
        </button>
      </AppPageHeader>

      <Card className="mb-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search clause…"
              className="w-full rounded-md border border-input bg-background py-1.5 pl-8 pr-3 text-sm outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
          <select
            value={fwFilter}
            onChange={(e) => setFwFilter(e.target.value)}
            className="rounded-md border border-input bg-background px-3 py-1.5 text-sm"
          >
            <option value="all">All Frameworks</option>
            {frameworks.map((f) => (
              <option key={f.id} value={f.id}>
                {f.label}
              </option>
            ))}
          </select>
          <select
            value={moduleFilter}
            onChange={(e) => setModuleFilter(e.target.value)}
            className="rounded-md border border-input bg-background px-3 py-1.5 text-sm"
          >
            <option value="all">All Modules</option>
            {modules.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-md border border-input bg-background px-3 py-1.5 text-sm"
          >
            <option value="all">All Statuses</option>
            <option value="not_assessed">Not Assessed</option>
            <option value="conforming">Conforming</option>
            <option value="partial">Partially Conforming</option>
            <option value="nonconforming">Nonconforming</option>
            <option value="evidence_missing">Evidence Missing</option>
            <option value="not_applicable">Not Applicable</option>
          </select>
        </div>
      </Card>

      <Card>
        {loading ? (
          <p className="py-6 text-center text-sm text-muted-foreground">Loading matrix…</p>
        ) : rows.length === 0 ? (
          <EmptyState title="No clauses match" body="Adjust filters." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left text-[11px] uppercase tracking-wide text-muted-foreground">
                  <th className="px-3 py-2">Framework</th>
                  <th className="px-3 py-2">Clause</th>
                  <th className="px-3 py-2">Title</th>
                  <th className="px-3 py-2">Module / Submodule</th>
                  <th className="px-3 py-2">Evidence</th>
                  <th className="px-3 py-2">Status</th>
                  <th className="px-3 py-2">Score</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.clause.id} className="border-b border-border/60 hover:bg-muted/30">
                    <td className="px-3 py-2.5 text-xs text-muted-foreground">
                      {r.fw?.label ?? "—"}
                    </td>
                    <td className="px-3 py-2.5">
                      <Link
                        to="/app/conformity/clauses"
                        className="font-mono text-xs font-semibold text-primary hover:underline"
                      >
                        {r.clause.number}
                      </Link>
                    </td>
                    <td className="px-3 py-2.5 text-xs text-foreground">{r.clause.title}</td>
                    <td className="px-3 py-2.5 text-xs text-muted-foreground">
                      {r.maps.length === 0
                        ? "—"
                        : r.maps.map((m) => `${m.module} / ${m.submodule}`).join(", ")}
                    </td>
                    <td className="px-3 py-2.5 text-xs text-muted-foreground">
                      {r.ev.length === 0 ? (
                        <span className="text-warning">none</span>
                      ) : (
                        `${r.ev.length} item(s)`
                      )}
                    </td>
                    <td className="px-3 py-2.5">
                      <StatusPill status={r.clause.assessmentStatus} compact />
                    </td>
                    <td className="px-3 py-2.5">
                      <ComplianceBadge pct={r.clause.complianceScore} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
