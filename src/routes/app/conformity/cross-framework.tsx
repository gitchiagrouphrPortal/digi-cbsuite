import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Link } from "@tanstack/react-router";
import {
  listEvidenceFn,
  listClausesFn,
  listFrameworksFn,
  listStandardsFn,
  listModuleMappingsFn,
} from "@/lib/conformity.functions";
import {
  INITIAL_CLAUSES,
  INITIAL_STANDARDS,
  INITIAL_FRAMEWORKS,
  INITIAL_MAPPINGS,
  INITIAL_EVIDENCE_LINKED,
} from "@/lib/conformity-client-data";
import type {
  EvidenceDTO,
  ClauseDTO,
  FrameworkDTO,
  StandardDTO,
  ModuleMappingDTO,
} from "@/lib/conformity-schema";
import {
  AppPageHeader,
  Card,
  EmptyState,
  SectionTitle,
  exportRowsCSV,
} from "@/components/app-primitives";
import { StatusPill, FrameworkTabs } from "@/components/conformity-ui";
import { Loader2, Download, ChevronRight, BookOpen, Layers, FileText } from "lucide-react";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/app/conformity/cross-framework")({
  head: () => ({
    meta: [
      { title: "Cross-Framework Mapping — DigiCB" },
      {
        name: "description",
        content:
          "Complete clause-to-module mapping across all four accreditation frameworks with shared evidence.",
      },
    ],
  }),
  component: Page,
});

interface ClauseRow {
  clause: ClauseDTO;
  standard: StandardDTO | undefined;
  mappings: ModuleMappingDTO[];
  children: ClauseRow[];
  level: number;
}

function buildClauseTree(
  clauses: ClauseDTO[],
  standardId: string,
  frameworkId: string,
  mappings: ModuleMappingDTO[],
  standards: StandardDTO[],
): ClauseRow[] {
  const stdClauses = clauses.filter((c) => c.standardId === standardId);
  const standard = standards.find((s) => s.id === standardId);
  const buildLevel = (parentId: string | null, level: number): ClauseRow[] => {
    return stdClauses
      .filter((c) => (c.parentId ?? null) === parentId)
      .sort((a, b) => {
        const na = a.number.split(".").map(Number);
        const nb = b.number.split(".").map(Number);
        for (let i = 0; i < Math.max(na.length, nb.length); i++) {
          const va = na[i] ?? 0;
          const vb = nb[i] ?? 0;
          if (va !== vb) return va - vb;
        }
        return 0;
      })
      .map((clause) => {
        const clauseMappings = mappings.filter(
          (m) => m.clauseId === clause.id || m.clauseRef === clause.number,
        );
        return {
          clause,
          standard,
          mappings: clauseMappings,
          children: buildLevel(clause.id, level + 1),
          level,
        };
      });
  };
  return buildLevel(null, 0);
}

function Page() {
  const getEvidence = useServerFn(listEvidenceFn);
  const getClauses = useServerFn(listClausesFn);
  const getFws = useServerFn(listFrameworksFn);
  const getStandards = useServerFn(listStandardsFn);
  const getMappings = useServerFn(listModuleMappingsFn);

  const [evidence, setEvidence] = useState<EvidenceDTO[]>(INITIAL_EVIDENCE_LINKED);
  const [clauses, setClauses] = useState<ClauseDTO[]>(INITIAL_CLAUSES);
  const [frameworks, setFrameworks] = useState<FrameworkDTO[]>(INITIAL_FRAMEWORKS);
  const [standards, setStandards] = useState<StandardDTO[]>(INITIAL_STANDARDS);
  const [mappings, setMappings] = useState<ModuleMappingDTO[]>(INITIAL_MAPPINGS);
  const [loading, setLoading] = useState(true);
  const [activeFramework, setActiveFramework] = useState("all");
  const [expandedClauses, setExpandedClauses] = useState<Set<string>>(new Set());

  useEffect(() => {
    let a = true;
    (async () => {
      setLoading(true);
      try {
        const [e, c, f, s, m] = await Promise.all([
          getEvidence(),
          getClauses(),
          getFws(),
          getStandards(),
          getMappings(),
        ]);
        if (!a) return;
        if (e.length) setEvidence(e);
        if (c.length) setClauses(c);
        if (f.length) setFrameworks(f);
        if (s.length) setStandards(s);
        if (m.length) setMappings(m);
      } catch {
        /* keep client seed data */
      } finally {
        if (a) setLoading(false);
      }
    })();
    return () => {
      a = false;
    };
  }, [getEvidence, getClauses, getFws, getStandards, getMappings]);

  // Evidence supporting multiple frameworks
  const crossEvidence = useMemo(() => {
    return evidence
      .map((e) => {
        const fwIds = new Set<string>();
        for (const cid of e.clauseIds) {
          const cl = clauses.find((c) => c.id === cid);
          if (cl) fwIds.add(cl.frameworkId);
        }
        return { ev: e, frameworks: Array.from(fwIds) };
      })
      .filter((x) => x.frameworks.length > 1);
  }, [evidence, clauses]);

  // Group standards by framework
  const frameworkData = useMemo(() => {
    const fws =
      activeFramework === "all" ? frameworks : frameworks.filter((f) => f.id === activeFramework);
    return fws.map((fw) => {
      const fwStandards = standards.filter((s) => s.frameworkId === fw.id);
      const standardTrees = fwStandards.map((std) => ({
        standard: std,
        tree: buildClauseTree(clauses, std.id, fw.id, mappings, standards),
      }));
      const fwClauses = clauses.filter((c) => c.frameworkId === fw.id);
      const fwMappings = mappings.filter((m) => {
        const cl = clauses.find((c) => c.id === m.clauseId);
        return cl?.frameworkId === fw.id;
      });
      return { framework: fw, standardTrees, fwClauses, fwMappings };
    });
  }, [frameworks, standards, clauses, mappings, activeFramework]);

  const toggleClause = (id: string) => {
    setExpandedClauses((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleExport = () => {
    const rows: Record<string, unknown>[] = [];
    for (const { framework, standardTrees } of frameworkData) {
      for (const { standard, tree } of standardTrees) {
        const flatten = (rows_: ClauseRow[]) => {
          for (const r of rows_) {
            rows.push({
              Framework: framework.label,
              Standard: standard.number,
              "Clause No.": r.clause.number,
              "Clause Title": r.clause.title,
              "Requirement Summary": r.clause.requirementSummary,
              "DigiCB Module": r.mappings.map((m) => m.module).join("; "),
              "DigiCB Submodule": r.mappings.map((m) => m.submodule).join("; "),
              Status: r.clause.assessmentStatus,
              "Compliance Score": r.clause.complianceScore,
            });
            flatten(r.children);
          }
        };
        flatten(tree);
      }
    }
    exportRowsCSV("cross-framework-mapping", rows);
  };

  const totalClauses = frameworkData.reduce((s, f) => s + f.fwClauses.length, 0);
  const totalMappings = frameworkData.reduce((s, f) => s + f.fwMappings.length, 0);
  const totalStandards = frameworkData.reduce((s, f) => s + f.standardTrees.length, 0);

  if (loading && clauses.length === 0) {
    return (
      <div>
        <AppPageHeader
          title="Cross-Framework Mapping"
          description="Complete clause-to-module mapping across all accreditation frameworks."
        />
        <Card className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" /> Loading…
        </Card>
      </div>
    );
  }

  return (
    <div>
      <AppPageHeader
        title="Cross-Framework Mapping"
        description="Complete clause hierarchy for every accreditation framework, showing which DigiCB module and submodule implements each clause. Evidence is reused across frameworks, but each framework maintains a separate assessment result."
      >
        <button
          onClick={handleExport}
          className="inline-flex items-center gap-1.5 rounded-md border border-input bg-background px-3 py-1.5 text-sm font-medium text-foreground hover:bg-accent"
        >
          <Download className="h-4 w-4" /> Export CSV
        </button>
      </AppPageHeader>

      {/* Summary stats */}
      <div className="mb-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="rounded-lg border border-border bg-card p-3">
          <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
            Frameworks
          </p>
          <p className="font-display text-xl font-bold text-foreground">{frameworkData.length}</p>
        </div>
        <div className="rounded-lg border border-border bg-card p-3">
          <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
            Standards
          </p>
          <p className="font-display text-xl font-bold text-foreground">{totalStandards}</p>
        </div>
        <div className="rounded-lg border border-border bg-card p-3">
          <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
            Total Clauses
          </p>
          <p className="font-display text-xl font-bold text-foreground">{totalClauses}</p>
        </div>
        <div className="rounded-lg border border-border bg-card p-3">
          <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
            Module Mappings
          </p>
          <p className="font-display text-xl font-bold text-foreground">{totalMappings}</p>
        </div>
      </div>

      <FrameworkTabs active={activeFramework} onChange={setActiveFramework} />

      {/* Framework sections */}
      <div className="space-y-6">
        {frameworkData.map(({ framework, standardTrees }) => (
          <div key={framework.id}>
            <div className="mb-3 flex items-center gap-2">
              <Layers className="h-5 w-5 text-primary" />
              <h2 className="font-display text-lg font-bold text-foreground">{framework.label}</h2>
              <span className="text-sm text-muted-foreground">{framework.description}</span>
            </div>

            {standardTrees.length === 0 ? (
              <Card>
                <EmptyState
                  title="No standards configured"
                  body="Add standards to this framework."
                />
              </Card>
            ) : (
              <div className="space-y-4">
                {standardTrees.map(({ standard, tree }) => (
                  <Card key={standard.id} className="p-4">
                    {/* Standard header */}
                    <div className="mb-3 flex flex-wrap items-start justify-between gap-2 border-b border-border pb-3">
                      <div className="flex items-start gap-2">
                        <FileText className="mt-0.5 h-4 w-4 text-info" />
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-sm font-bold text-foreground">
                              {standard.number}
                            </span>
                            <StatusPill status={standard.status} compact />
                          </div>
                          <p className="mt-0.5 text-xs text-muted-foreground">{standard.title}</p>
                          <p className="mt-0.5 text-[10px] text-muted-foreground">
                            Issued by {standard.issuingOrg} · Revision {standard.revision} · Owner:{" "}
                            {standard.owner}
                          </p>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {standard.applicableSchemes.map((sc) => (
                          <span
                            key={sc}
                            className="rounded bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground"
                          >
                            {sc}
                          </span>
                        ))}
                      </div>
                    </div>

                    {tree.length === 0 ? (
                      <p className="py-2 text-xs italic text-muted-foreground">
                        No clause records stored for this standard. Clause numbers, titles and
                        internal summaries are managed in the Clause Library — no copyrighted
                        standard text is reproduced.
                      </p>
                    ) : (
                      <ClauseTreeView
                        rows={tree}
                        expanded={expandedClauses}
                        onToggle={toggleClause}
                        frameworks={frameworks}
                      />
                    )}
                  </Card>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Cross-framework shared evidence */}
      <Card className="mt-6">
        <SectionTitle>
          <span className="flex items-center gap-2">
            <BookOpen className="h-4 w-4 text-info" /> Shared Evidence Across Frameworks (
            {crossEvidence.length})
          </span>
        </SectionTitle>
        <p className="mt-1 text-xs text-muted-foreground">
          Evidence items linked to clauses in more than one framework. Evidence is reused, but each
          framework's clause assessment is recorded independently — assessments are never merged.
        </p>
        {crossEvidence.length === 0 ? (
          <EmptyState
            title="No cross-framework evidence"
            body="Link evidence to clauses in multiple frameworks to see it here."
          />
        ) : (
          <div className="mt-3 overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left text-[11px] uppercase tracking-wide text-muted-foreground">
                  <th className="px-3 py-2">Evidence</th>
                  <th className="px-3 py-2">Type</th>
                  <th className="px-3 py-2">Frameworks</th>
                  <th className="px-3 py-2">Clauses</th>
                  <th className="px-3 py-2">Validity</th>
                </tr>
              </thead>
              <tbody>
                {crossEvidence.map(({ ev, frameworks: fws }) => (
                  <tr key={ev.id} className="border-b border-border/60 hover:bg-muted/30">
                    <td className="px-3 py-2.5 text-foreground">{ev.title}</td>
                    <td className="px-3 py-2.5 text-xs text-muted-foreground">{ev.evidenceType}</td>
                    <td className="px-3 py-2.5">
                      <div className="flex flex-wrap gap-1">
                        {fws.map((fid) => {
                          const f = frameworks.find((x) => x.id === fid);
                          return (
                            <span
                              key={fid}
                              className="rounded bg-primary/10 px-1.5 py-0.5 text-[10px] font-medium text-primary"
                            >
                              {f?.label ?? fid}
                            </span>
                          );
                        })}
                      </div>
                    </td>
                    <td className="px-3 py-2.5 text-xs">
                      <div className="flex flex-wrap gap-1">
                        {ev.clauseIds.map((cid) => {
                          const cl = clauses.find((c) => c.id === cid);
                          return cl ? (
                            <Link
                              key={cid}
                              to="/app/conformity/clauses"
                              className="font-mono text-primary hover:underline"
                            >
                              {cl.number}
                            </Link>
                          ) : null;
                        })}
                      </div>
                    </td>
                    <td className="px-3 py-2.5">
                      <StatusPill
                        status={ev.validity === "valid" ? "conforming" : "evidence_expired"}
                        compact
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <Card className="mt-4">
        <SectionTitle>Separate Assessment Rule</SectionTitle>
        <p className="mt-2 text-sm text-muted-foreground">
          When evidence is reused across frameworks, each framework's clause assessment is recorded
          independently. Closing an NCR in one framework does not change another framework's
          assessment. Reuse evidence, never merge results.
        </p>
        <p className="mt-3 text-[10px] text-muted-foreground">
          INITIAL REFERENCE DATA — REVIEW AND APPROVAL REQUIRED. Only clause numbers, titles and
          internal summaries are stored — no copyrighted standard text is reproduced.
        </p>
      </Card>
    </div>
  );
}

function ClauseTreeView({
  rows,
  expanded,
  onToggle,
  frameworks,
}: {
  rows: ClauseRow[];
  expanded: Set<string>;
  onToggle: (id: string) => void;
  frameworks: FrameworkDTO[];
}) {
  return (
    <div className="space-y-1">
      {rows.map((row) => (
        <ClauseTreeRow
          key={row.clause.id}
          row={row}
          expanded={expanded}
          onToggle={onToggle}
          frameworks={frameworks}
        />
      ))}
    </div>
  );
}

function ClauseTreeRow({
  row,
  expanded,
  onToggle,
  frameworks,
}: {
  row: ClauseRow;
  expanded: Set<string>;
  onToggle: (id: string) => void;
  frameworks: FrameworkDTO[];
}) {
  const { clause, mappings, children, level } = row;
  const hasChildren = children.length > 0;
  const isExpanded = expanded.has(clause.id);
  const isParent = level === 0 || (hasChildren && level <= 1);

  return (
    <div>
      <div
        className={cn(
          "flex flex-wrap items-start gap-2 rounded-md border border-border/60 px-3 py-2",
          isParent ? "bg-muted/40" : "bg-card",
        )}
        style={{ marginLeft: level * 16 }}
      >
        {/* Expand toggle */}
        <button
          onClick={() => hasChildren && onToggle(clause.id)}
          className={cn(
            "mt-0.5 shrink-0",
            hasChildren
              ? "cursor-pointer text-muted-foreground hover:text-foreground"
              : "invisible",
          )}
        >
          <ChevronRight
            className={cn("h-3.5 w-3.5 transition-transform", isExpanded && "rotate-90")}
          />
        </button>

        {/* Clause number + title */}
        <div className="min-w-[180px] flex-1">
          <div className="flex items-center gap-2">
            <Link
              to="/app/conformity/clauses"
              className="font-mono text-xs font-bold text-primary hover:underline"
            >
              {clause.number}
            </Link>
            <span className="text-xs font-medium text-foreground">{clause.title}</span>
          </div>
          <p className="mt-0.5 text-[10px] text-muted-foreground">{clause.requirementSummary}</p>
        </div>

        {/* Status */}
        <div className="shrink-0">
          <StatusPill status={clause.assessmentStatus} compact />
        </div>

        {/* Module / submodule mappings */}
        <div className="min-w-[200px] flex-1">
          {mappings.length === 0 ? (
            <span className="text-[10px] italic text-muted-foreground">No module mapped</span>
          ) : (
            <div className="flex flex-wrap gap-1">
              {mappings.map((m, i) => (
                <span
                  key={i}
                  className="inline-flex items-center gap-1 rounded border border-info/20 bg-info/5 px-1.5 py-0.5 text-[10px]"
                >
                  <span className="font-semibold text-info">{m.module}</span>
                  <span className="text-muted-foreground">›</span>
                  <span className="text-foreground">{m.submodule}</span>
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      {hasChildren && isExpanded && (
        <div className="mt-1 space-y-1">
          {children.map((child) => (
            <ClauseTreeRow
              key={child.clause.id}
              row={child}
              expanded={expanded}
              onToggle={onToggle}
              frameworks={frameworks}
            />
          ))}
        </div>
      )}
    </div>
  );
}
