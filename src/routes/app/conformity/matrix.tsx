import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Link } from "@tanstack/react-router";
import { listClausesFn, listModuleMappingsFn, listFrameworksFn } from "@/lib/conformity.functions";
import type { ClauseDTO, ModuleMappingDTO, FrameworkDTO } from "@/lib/conformity-schema";
import { AppPageHeader, Card, EmptyState, SectionTitle } from "@/components/app-primitives";
import { StatusPill, ComplianceBadge } from "@/components/conformity-ui";
import { Search } from "lucide-react";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/app/conformity/matrix")({
  head: () => ({
    meta: [
      { title: "Module-Clause Matrix — DigiCB" },
      {
        name: "description",
        content: "Mapping of DigiCB modules and submodules to accreditation clauses.",
      },
    ],
  }),
  component: Page,
});

function Page() {
  const getClauses = useServerFn(listClausesFn);
  const getMappings = useServerFn(listModuleMappingsFn);
  const getFws = useServerFn(listFrameworksFn);
  const [clauses, setClauses] = useState<ClauseDTO[]>([]);
  const [mappings, setMappings] = useState<ModuleMappingDTO[]>([]);
  const [frameworks, setFrameworks] = useState<FrameworkDTO[]>([]);
  const [fwFilter, setFwFilter] = useState("all");
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let a = true;
    (async () => {
      setLoading(true);
      try {
        const [c, m, f] = await Promise.all([getClauses(), getMappings(), getFws()]);
        if (!a) return;
        setClauses(c);
        setMappings(m);
        setFrameworks(f);
      } catch {
        /* keep empty state */
      } finally {
        if (a) setLoading(false);
      }
    })();
    return () => {
      a = false;
    };
  }, [getClauses, getMappings, getFws]);

  // Group mappings by module
  const grouped = useMemo(() => {
    const map = new Map<
      string,
      { module: string; rows: { mapping: ModuleMappingDTO; clause?: ClauseDTO }[] }
    >();
    let filtered = mappings;
    if (fwFilter !== "all") {
      filtered = mappings.filter((m) => {
        const clause = clauses.find((c) => c.id === m.clauseId);
        return clause?.frameworkId === fwFilter;
      });
    }
    if (query.trim()) {
      const q = query.toLowerCase();
      filtered = filtered.filter(
        (m) =>
          m.module.toLowerCase().includes(q) ||
          m.submodule.toLowerCase().includes(q) ||
          m.clauseRef.toLowerCase().includes(q),
      );
    }
    for (const m of filtered) {
      const clause = clauses.find((c) => c.id === m.clauseId);
      const key = m.module;
      if (!map.has(key)) map.set(key, { module: key, rows: [] });
      map.get(key)!.rows.push({ mapping: m, clause });
    }
    return Array.from(map.values()).sort((a, b) => a.module.localeCompare(b.module));
  }, [mappings, clauses, fwFilter, query]);

  return (
    <div>
      <AppPageHeader
        title="Module-Clause Matrix"
        description="Which DigiCB module implements which accreditation clause. Editable starting configuration — supports multiple clauses per module and multiple modules per clause."
      >
        <Link
          to="/app/conformity/reference"
          className="inline-flex h-9 items-center gap-1.5 rounded-md border border-input bg-background px-3 text-sm font-medium text-foreground hover:bg-accent"
        >
          Reference Matrix
        </Link>
      </AppPageHeader>

      <Card className="mb-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search module, submodule or clause…"
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
        </div>
      </Card>

      {loading ? (
        <Card>
          <p className="py-6 text-center text-sm text-muted-foreground">Loading mappings…</p>
        </Card>
      ) : grouped.length === 0 ? (
        <Card>
          <EmptyState
            title="No mappings"
            body="Module-clause mappings are seeded for ISO/IEC 17021-1."
          />
        </Card>
      ) : (
        <div className="space-y-4">
          {grouped.map((g) => (
            <Card key={g.module}>
              <SectionTitle>{g.module}</SectionTitle>
              <div className="mt-3 overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border text-left text-[11px] uppercase tracking-wide text-muted-foreground">
                      <th className="px-3 py-2">Submodule / Function</th>
                      <th className="px-3 py-2">Clause</th>
                      <th className="px-3 py-2">Clause Title</th>
                      <th className="px-3 py-2">Status</th>
                      <th className="px-3 py-2">Compliance</th>
                    </tr>
                  </thead>
                  <tbody>
                    {g.rows.map(({ mapping, clause }) => (
                      <tr key={mapping.id} className="border-b border-border/60 hover:bg-muted/30">
                        <td className="px-3 py-2.5 text-foreground">{mapping.submodule}</td>
                        <td className="px-3 py-2.5">
                          {clause ? (
                            <Link
                              to="/app/conformity/clauses"
                              className="font-mono text-xs font-semibold text-primary hover:underline"
                            >
                              {clause.number}
                            </Link>
                          ) : (
                            <span className="font-mono text-xs text-muted-foreground">
                              {mapping.clauseRef}
                            </span>
                          )}
                        </td>
                        <td className="px-3 py-2.5 text-xs text-muted-foreground">
                          {clause?.title ?? "—"}
                        </td>
                        <td className="px-3 py-2.5">
                          {clause && <StatusPill status={clause.assessmentStatus} compact />}
                        </td>
                        <td className="px-3 py-2.5">
                          {clause && <ComplianceBadge pct={clause.complianceScore} />}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
