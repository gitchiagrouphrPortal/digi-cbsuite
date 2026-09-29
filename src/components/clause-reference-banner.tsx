// DigiCB — compact clause-reference banner shown at the top of every
// module/submodule list page. Displays the applicable accreditation clauses
// (across all four frameworks) for the module, each as a link to the Clause
// Library. Renders instantly from client seed data, then hydrates from server.
import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { listClausesFn, listModuleMappingsFn, listStandardsFn } from "@/lib/conformity.functions";
import { INITIAL_CLAUSES, INITIAL_STANDARDS, INITIAL_MAPPINGS } from "@/lib/conformity-client-data";
import type { ClauseDTO, ModuleMappingDTO, StandardDTO } from "@/lib/conformity-schema";
import { moduleForCollection } from "@/lib/conformity-record-link";
import { cn } from "@/lib/utils";
import { ShieldCheck, BookOpen, ChevronDown, ChevronUp, ExternalLink } from "lucide-react";

const FW_LABELS: Record<string, string> = {
  fw_17021: "ISO/IEC 17021-1",
  fw_ps4992: "PS 4992 / OIC-SMIIC 2",
  fw_17024: "ISO/IEC 17024",
  fw_17065: "ISO/IEC 17065",
};

const FW_SHORT: Record<string, string> = {
  fw_17021: "17021",
  fw_ps4992: "PS4992",
  fw_17024: "17024",
  fw_17065: "17065",
};

export function ClauseReferenceBanner({ collectionKey }: { collectionKey: string }) {
  const moduleName = moduleForCollection(collectionKey);
  const [clauses, setClauses] = useState<ClauseDTO[]>(INITIAL_CLAUSES);
  const [mappings, setMappings] = useState<ModuleMappingDTO[]>(INITIAL_MAPPINGS);
  const [standards, setStandards] = useState<StandardDTO[]>(INITIAL_STANDARDS);
  const [expanded, setExpanded] = useState(false);

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
      })
      .catch(() => {});
    return () => {
      alive = false;
    };
    /* eslint-disable-next-line */
  }, []);

  if (!moduleName) return null;

  const moduleMappings = mappings.filter((m) => m.module === moduleName);
  const resolved = moduleMappings
    .map((m) => {
      const clause = clauses.find((c) => c.id === m.clauseId);
      if (!clause) return null;
      const standard = standards.find((s) => s.id === clause.standardId);
      return { clause, standard, mapping: m };
    })
    .filter((x): x is NonNullable<typeof x> => x !== null);

  if (resolved.length === 0) return null;

  // Group by framework
  const grouped: Record<string, typeof resolved> = {};
  for (const r of resolved) {
    (grouped[r.clause.frameworkId] ??= []).push(r);
  }
  const fwIds = Object.keys(grouped);

  return (
    <div className="mb-4 rounded-lg border border-info/25 bg-info/5">
      <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-2.5">
        <div className="flex items-center gap-2">
          <ShieldCheck className="h-4 w-4 text-info" />
          <span className="text-xs font-semibold text-foreground">
            Applicable accreditation clauses
          </span>
          <span className="text-[11px] text-muted-foreground">
            {resolved.length} clause{resolved.length !== 1 ? "s" : ""} · {fwIds.length} framework
            {fwIds.length !== 1 ? "s" : ""}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Link
            to="/app/conformity/matrix"
            className="inline-flex items-center gap-1 text-[11px] font-medium text-info hover:underline"
          >
            <ExternalLink className="h-3 w-3" /> Matrix
          </Link>
          <button
            onClick={() => setExpanded((e) => !e)}
            className="inline-flex items-center gap-1 text-[11px] font-medium text-muted-foreground hover:text-foreground"
          >
            {expanded ? (
              <>
                <ChevronUp className="h-3 w-3" /> Hide
              </>
            ) : (
              <>
                <ChevronDown className="h-3 w-3" /> Show
              </>
            )}
          </button>
        </div>
      </div>

      {expanded && (
        <div className="space-y-3 border-t border-info/20 px-4 py-3">
          {fwIds.map((fwId) => {
            const items = grouped[fwId];
            return (
              <div key={fwId}>
                <div className="mb-1.5 flex items-center gap-1.5">
                  <BookOpen className="h-3 w-3 text-muted-foreground" />
                  <span className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                    {FW_LABELS[fwId] ?? fwId}
                  </span>
                  <span className="text-[10px] text-muted-foreground">({items.length})</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {items.map(({ clause, standard }) => (
                    <Link
                      key={clause.id}
                      to="/app/conformity/clauses"
                      className={cn(
                        "group inline-flex items-center gap-1 rounded-md border border-border bg-background px-2 py-1",
                        "text-[11px] font-medium text-foreground hover:border-primary/40 hover:bg-primary/5",
                      )}
                      title={`${clause.title} — ${standard?.number ?? ""}`}
                    >
                      <span className="font-mono text-primary">{clause.number}</span>
                      <span className="text-muted-foreground">·</span>
                      <span className="max-w-[160px] truncate">{clause.title}</span>
                      <span className="rounded bg-muted px-1 text-[9px] text-muted-foreground">
                        {FW_SHORT[fwId] ?? fwId}
                      </span>
                    </Link>
                  ))}
                </div>
              </div>
            );
          })}
          <p className="text-[10px] text-muted-foreground">
            INITIAL REFERENCE DATA — REVIEW AND APPROVAL REQUIRED. Clause references are editable in
            the Module-Clause Matrix. Only clause numbers, titles and internal summaries are stored
            — no copyrighted standard text.
          </p>
        </div>
      )}
    </div>
  );
}
