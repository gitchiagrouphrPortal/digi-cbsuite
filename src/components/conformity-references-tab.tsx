// DigiCB — Conformity References tab for any operational record.
// Shows which accreditation clauses (across all four frameworks) apply to the
// record's module, filtered by the record's framework when set. Renders
// clause number, title, internal requirement summary, assessment status and a
// link to the clause library. Uses client-side seed data for instant render,
// then hydrates from the server for any user edits.
import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { listClausesFn, listModuleMappingsFn, listStandardsFn } from "@/lib/conformity.functions";
import { INITIAL_CLAUSES, INITIAL_STANDARDS, INITIAL_MAPPINGS } from "@/lib/conformity-client-data";
import type { ClauseDTO, ModuleMappingDTO, StandardDTO } from "@/lib/conformity-schema";
import type { RecordDTO } from "@/lib/records-schema";
import { moduleForCollection, frameworkIdFromRecord } from "@/lib/conformity-record-link";
import { Card, EmptyState, SectionTitle } from "@/components/app-primitives";
import { StatusPill } from "@/components/conformity-ui";
import { cn } from "@/lib/utils";
import { ShieldCheck, ExternalLink, BookOpen } from "lucide-react";

interface ResolvedClause {
  clause: ClauseDTO;
  standard: StandardDTO | undefined;
  mapping: ModuleMappingDTO;
}

export function ConformityReferencesTab({
  record,
  collectionKey,
}: {
  record: RecordDTO;
  collectionKey: string;
}) {
  const moduleName = moduleForCollection(collectionKey);
  const recordFrameworkId = frameworkIdFromRecord(
    (record.framework as string | null) ??
      (record.data.framework as string | null | undefined) ??
      null,
  );

  const [clauses, setClauses] = useState<ClauseDTO[]>(INITIAL_CLAUSES);
  const [mappings, setMappings] = useState<ModuleMappingDTO[]>(INITIAL_MAPPINGS);
  const [standards, setStandards] = useState<StandardDTO[]>(INITIAL_STANDARDS);
  const [filterFw, setFilterFw] = useState<string>(recordFrameworkId ?? "all");
  const [hydrated, setHydrated] = useState(false);

  const getClauses = useServerFn(listClausesFn);
  const getMappings = useServerFn(listModuleMappingsFn);
  const getStandards = useServerFn(listStandardsFn);

  useEffect(() => {
    let alive = true;
    Promise.all([getClauses(), getMappings(), getStandards()])
      .then(([c, m, s]) => {
        if (!alive) return;
        setClauses(c);
        setMappings(m);
        setStandards(s);
        setHydrated(true);
      })
      .catch(() => {
        /* keep client seed data */
        setHydrated(true);
      });
    return () => {
      alive = false;
    };
    /* eslint-disable-next-line */
  }, []);

  if (!moduleName) {
    return (
      <EmptyState
        title="No clause mapping configured"
        body="This record type is not yet linked to an accreditation module in the conformity engine."
      />
    );
  }

  // Resolve mappings: match by module name. If the record has a framework,
  // also narrow to that framework's clauses (but still show cross-framework
  // mappings when "all" is selected).
  const moduleMappings = mappings.filter((m) => m.module === moduleName);
  const resolved: ResolvedClause[] = moduleMappings
    .map((m) => {
      const clause = clauses.find((c) => c.id === m.clauseId);
      if (!clause) return null;
      if (filterFw !== "all" && clause.frameworkId !== filterFw) return null;
      const standard = standards.find((s) => s.id === clause.standardId);
      return { clause, standard, mapping: m };
    })
    .filter((x): x is ResolvedClause => x !== null);

  // Group by framework for display
  const fwLabels: Record<string, string> = {
    fw_17021: "ISO/IEC 17021-1 (Management Systems)",
    fw_ps4992: "PS 4992 / OIC-SMIIC 2 (Halal)",
    fw_17024: "ISO/IEC 17024 (Personnel)",
    fw_17065: "ISO/IEC 17065 (Product)",
  };
  const grouped: Record<string, ResolvedClause[]> = {};
  for (const r of resolved) {
    (grouped[r.clause.frameworkId] ??= []).push(r);
  }

  const fwOptions = [
    { value: "all", label: "All Frameworks" },
    { value: "fw_17021", label: "ISO/IEC 17021-1" },
    { value: "fw_ps4992", label: "PS 4992 (Halal)" },
    { value: "fw_17024", label: "ISO/IEC 17024" },
    { value: "fw_17065", label: "ISO/IEC 17065" },
  ];

  return (
    <Card>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <SectionTitle className="flex items-center gap-2 text-sm">
          <ShieldCheck className="h-4 w-4 text-primary" />
          Conformity References — {moduleName}
        </SectionTitle>
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">Framework:</span>
          <select
            value={filterFw}
            onChange={(e) => setFilterFw(e.target.value)}
            className="rounded-md border border-input bg-background px-2 py-1 text-xs outline-none focus:ring-2 focus:ring-ring"
          >
            {fwOptions.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <p className="mt-2 text-xs text-muted-foreground">
        These accreditation clauses are implemented through the{" "}
        <span className="font-medium text-foreground">{moduleName}</span> module. Each clause shows
        the applicable standard, internal requirement summary and current assessment status. Clause
        text is not reproduced — only references and internal summaries are stored.
        {!hydrated && " (Loading latest from server…)"}
      </p>

      {resolved.length === 0 ? (
        <div className="mt-4">
          <EmptyState
            title="No clauses mapped"
            body={`No clause mappings found for ${moduleName}${
              filterFw !== "all" ? " under this framework" : ""
            }. An administrator can add mappings via the Module-Clause Matrix.`}
            action={
              <Link
                to="/app/conformity/matrix"
                className="text-sm font-medium text-primary hover:underline"
              >
                Open Module-Clause Matrix →
              </Link>
            }
          />
        </div>
      ) : (
        <div className="mt-4 space-y-5">
          {Object.entries(grouped).map(([fwId, items]) => (
            <div key={fwId}>
              <div className="mb-2 flex items-center gap-2">
                <BookOpen className="h-3.5 w-3.5 text-muted-foreground" />
                <h4 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  {fwLabels[fwId] ?? fwId}
                </h4>
                <span className="text-[10px] text-muted-foreground">({items.length} clauses)</span>
              </div>
              <div className="overflow-hidden rounded-lg border border-border">
                <table className="w-full text-sm">
                  <thead className="bg-muted/40">
                    <tr className="text-left text-[10px] uppercase tracking-wide text-muted-foreground">
                      <th className="px-3 py-2 font-semibold">Clause</th>
                      <th className="px-3 py-2 font-semibold">Title</th>
                      <th className="px-3 py-2 font-semibold">Standard</th>
                      <th className="px-3 py-2 font-semibold">Requirement summary</th>
                      <th className="px-3 py-2 font-semibold">Status</th>
                      <th className="px-3 py-2 font-semibold">Score</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {items.map(({ clause, standard, mapping }) => (
                      <tr key={clause.id} className="hover:bg-muted/20">
                        <td className="px-3 py-2 align-top">
                          <Link
                            to="/app/conformity/clauses"
                            className="font-mono text-xs font-semibold text-primary hover:underline"
                          >
                            {clause.number}
                          </Link>
                        </td>
                        <td className="px-3 py-2 align-top text-xs font-medium text-foreground">
                          {clause.title}
                          <p className="mt-0.5 text-[10px] text-muted-foreground">
                            via {mapping.submodule}
                          </p>
                        </td>
                        <td className="px-3 py-2 align-top text-[11px] text-muted-foreground">
                          {standard?.number ?? "—"}
                        </td>
                        <td className="max-w-xs px-3 py-2 align-top text-[11px] text-muted-foreground">
                          {clause.requirementSummary}
                        </td>
                        <td className="px-3 py-2 align-top">
                          <StatusPill status={clause.assessmentStatus} compact />
                        </td>
                        <td className="px-3 py-2 align-top text-xs font-semibold text-foreground">
                          {clause.complianceScore}%
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="mt-4 flex flex-wrap gap-2 border-t border-border pt-3">
        <Link
          to="/app/conformity/reference"
          className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
        >
          <ExternalLink className="h-3 w-3" /> Conformity Reference Matrix
        </Link>
        <Link
          to="/app/conformity/matrix"
          className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
        >
          <ExternalLink className="h-3 w-3" /> Module-Clause Matrix
        </Link>
        <Link
          to="/app/conformity/clauses"
          className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
        >
          <ExternalLink className="h-3 w-3" /> Clause Library
        </Link>
        <Link
          to="/app/conformity"
          className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
        >
          <ExternalLink className="h-3 w-3" /> Conformity Dashboard
        </Link>
      </div>

      <p
        className={cn(
          "mt-3 rounded-md bg-info/10 px-3 py-2 text-[10px] text-info",
          "border border-info/20",
        )}
      >
        INITIAL REFERENCE DATA — REVIEW AND APPROVAL REQUIRED. Clause mappings are editable by
        authorized administrators in the Module-Clause Matrix. Compliance status is calculated from
        assessments and evidence, not manually entered.
      </p>
    </Card>
  );
}
