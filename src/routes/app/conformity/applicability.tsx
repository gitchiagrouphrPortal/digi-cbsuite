import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Link } from "@tanstack/react-router";
import { listClausesFn, listFrameworksFn, listStandardsFn } from "@/lib/conformity.functions";
import {
  INITIAL_CLAUSES,
  INITIAL_FRAMEWORKS,
  INITIAL_STANDARDS,
} from "@/lib/conformity-client-data";
import type { ClauseDTO, FrameworkDTO, StandardDTO } from "@/lib/conformity-schema";
import { AppPageHeader, Card, EmptyState, exportRowsCSV } from "@/components/app-primitives";
import { StatusPill } from "@/components/conformity-ui";
import { Search, Download } from "lucide-react";

export const Route = createFileRoute("/app/conformity/applicability")({
  head: () => ({
    meta: [
      { title: "Clause Applicability — DigiCB" },
      {
        name: "description",
        content: "Configure which clauses apply per framework, scheme, scope and client type.",
      },
    ],
  }),
  component: Page,
});

const FW_LABELS: Record<string, string> = {
  fw_17021: "ISO/IEC 17021-1",
  fw_ps4992: "PS 4992 / OIC-SMIIC 2",
  fw_17024: "ISO/IEC 17024",
  fw_17065: "ISO/IEC 17065",
};

// Framework-specific applicability context per clause.
function applicabilityDetail(clause: ClauseDTO): string {
  const fw = clause.frameworkId;
  if (clause.assessmentStatus === "not_applicable") {
    return "Not Applicable — approved exclusion with written justification (see assessment notes).";
  }
  if (fw === "fw_17021") {
    if (clause.number.startsWith("10.1") || clause.number === "10.3")
      return "Conditional — Option B only; not selected by this CB (Option A operated).";
    if (clause.number.startsWith("9.1.6"))
      return "Conditional — applies only to integrated/multiple management-system audits.";
    if (clause.number.startsWith("9.6.4"))
      return "Conditional — applies only to special/short-notice audits.";
    return "Applicable to all management-system certification activities (QMS, EMS, OHSMS, ISMS, FSMS, AIMS).";
  }
  if (fw === "fw_ps4992") {
    if (clause.number.startsWith("6.10") || clause.number.startsWith("8.11"))
      return "Conditional — applies only when outsourcing Halal inspection/testing activities.";
    if (clause.number.startsWith("8.15"))
      return "Conditional — triggered by client ingredient/process change notifications.";
    return "Applicable to all Halal product, service, process and management-system certification under PS 4992 / OIC-SMIIC 2.";
  }
  if (fw === "fw_17024") {
    if (clause.number.startsWith("8.6"))
      return "Conditional — applies to recertification cycles per scheme requirements.";
    if (clause.number.startsWith("7.1"))
      return "Applicable to all personnel-certification schemes operated by the CB.";
    return "Applicable to all personnel certification activities and examination processes.";
  }
  if (fw === "fw_17065") {
    if (clause.number.startsWith("8.7"))
      return "Conditional — applies to recertification per product scheme cycle.";
    if (clause.number.startsWith("6.4"))
      return "Conditional — applies when outsourcing testing/inspection to external laboratories.";
    return "Applicable to all product, process and service certification under ISO/IEC 17065.";
  }
  return clause.applicability || "Applicable";
}

function Page() {
  const getClauses = useServerFn(listClausesFn);
  const getFws = useServerFn(listFrameworksFn);
  const getStandards = useServerFn(listStandardsFn);
  const [clauses, setClauses] = useState<ClauseDTO[]>(INITIAL_CLAUSES);
  const [frameworks, setFrameworks] = useState<FrameworkDTO[]>(INITIAL_FRAMEWORKS);
  const [standards, setStandards] = useState<StandardDTO[]>(INITIAL_STANDARDS);
  const [fwFilter, setFwFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let a = true;
    (async () => {
      setLoading(true);
      try {
        const [c, f, s] = await Promise.all([getClauses(), getFws(), getStandards()]);
        if (!a) return;
        if (c.length) setClauses(c);
        if (f.length) setFrameworks(f);
        if (s.length) setStandards(s);
      } catch {
        /* keep client seed data */
      } finally {
        if (a) setLoading(false);
      }
    })();
    return () => {
      a = false;
    };
  }, [getClauses, getFws, getStandards]);

  const filtered = clauses
    .filter((c) => fwFilter === "all" || c.frameworkId === fwFilter)
    .filter((c) => statusFilter === "all" || c.assessmentStatus === statusFilter)
    .filter(
      (c) =>
        !query.trim() ||
        c.number.toLowerCase().includes(query.toLowerCase()) ||
        c.title.toLowerCase().includes(query.toLowerCase()),
    )
    .sort((a, b) => {
      const fa = a.frameworkId;
      const fb = b.frameworkId;
      if (fa !== fb) return fa.localeCompare(fb);
      const na = a.number.split(".").map(Number);
      const nb = b.number.split(".").map(Number);
      for (let i = 0; i < Math.max(na.length, nb.length); i++) {
        const va = na[i] ?? 0;
        const vb = nb[i] ?? 0;
        if (va !== vb) return va - vb;
      }
      return 0;
    });

  const handleExport = () => {
    const rows = filtered.map((c) => ({
      Framework: FW_LABELS[c.frameworkId] ?? c.frameworkId,
      "Clause No.": c.number,
      "Clause Title": c.title,
      "Requirement Summary": c.requirementSummary,
      Applicability: applicabilityDetail(c),
      Mandatory: c.mandatory ? "Mandatory" : "Guidance",
      "Assessment Status": c.assessmentStatus,
      "Compliance Score": c.complianceScore,
      "Last Assessed": c.lastAssessed ?? "Not assessed",
      "Next Assessment": c.nextAssessment ?? "—",
      Assessor: c.assessor ?? "—",
    }));
    exportRowsCSV("clause-applicability", rows);
  };

  const counts = {
    applicable: clauses.filter((c) => c.assessmentStatus !== "not_applicable").length,
    conditional: clauses.filter((c) =>
      applicabilityDetail(c).toLowerCase().startsWith("conditional"),
    ).length,
    notApplicable: clauses.filter((c) => c.assessmentStatus === "not_applicable").length,
  };

  return (
    <div>
      <AppPageHeader
        title="Clause Applicability"
        description="Applicability is configurable by accreditation body, standard, scheme, country, scope, client type, audit type and document version. Not Applicable requires written justification and approval."
      >
        <button
          onClick={handleExport}
          className="inline-flex h-9 items-center gap-1.5 rounded-md border border-input bg-background px-3 text-sm font-medium text-foreground hover:bg-accent"
        >
          <Download className="h-4 w-4" /> Export CSV
        </button>
      </AppPageHeader>

      <div className="mb-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="rounded-lg border border-border bg-card p-3">
          <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
            Total Clauses
          </p>
          <p className="font-display text-xl font-bold text-foreground">{clauses.length}</p>
        </div>
        <div className="rounded-lg border border-border bg-card p-3">
          <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
            Applicable
          </p>
          <p className="font-display text-xl font-bold text-success">{counts.applicable}</p>
        </div>
        <div className="rounded-lg border border-border bg-card p-3">
          <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
            Conditional
          </p>
          <p className="font-display text-xl font-bold text-warning">{counts.conditional}</p>
        </div>
        <div className="rounded-lg border border-border bg-card p-3">
          <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
            Not Applicable
          </p>
          <p className="font-display text-xl font-bold text-muted-foreground">
            {counts.notApplicable}
          </p>
        </div>
      </div>

      <Card className="mb-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search clause number or title…"
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
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-md border border-input bg-background px-3 py-1.5 text-sm"
          >
            <option value="all">All Statuses</option>
            <option value="conforming">Conforming</option>
            <option value="partial">Partially Conforming</option>
            <option value="not_assessed">Not Assessed</option>
            <option value="evidence_missing">Evidence Missing</option>
            <option value="not_applicable">Not Applicable</option>
          </select>
        </div>
      </Card>

      <Card>
        {loading && filtered.length === 0 ? (
          <p className="py-6 text-center text-sm text-muted-foreground">Loading…</p>
        ) : filtered.length === 0 ? (
          <EmptyState title="No clauses" body="Adjust filters." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left text-[11px] uppercase tracking-wide text-muted-foreground">
                  <th className="px-3 py-2">Framework</th>
                  <th className="px-3 py-2">Clause</th>
                  <th className="px-3 py-2">Title</th>
                  <th className="px-3 py-2">Applicability</th>
                  <th className="px-3 py-2">Mandatory</th>
                  <th className="px-3 py-2">Assessment</th>
                  <th className="px-3 py-2">Status</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((c) => {
                  const detail = applicabilityDetail(c);
                  const isConditional = detail.toLowerCase().startsWith("conditional");
                  const isNA = c.assessmentStatus === "not_applicable";
                  return (
                    <tr key={c.id} className="border-b border-border/60 hover:bg-muted/30">
                      <td className="px-3 py-2.5">
                        <span className="rounded bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
                          {FW_LABELS[c.frameworkId] ?? c.frameworkId}
                        </span>
                      </td>
                      <td className="px-3 py-2.5">
                        <Link
                          to="/app/conformity/clauses"
                          className="font-mono text-xs font-semibold text-primary hover:underline"
                        >
                          {c.number}
                        </Link>
                      </td>
                      <td className="px-3 py-2.5 text-xs text-foreground">{c.title}</td>
                      <td className="px-3 py-2.5 text-xs">
                        <span
                          className={
                            isConditional
                              ? "font-medium text-warning"
                              : isNA
                                ? "text-muted-foreground italic"
                                : "text-muted-foreground"
                          }
                        >
                          {detail}
                        </span>
                      </td>
                      <td className="px-3 py-2.5 text-xs">
                        {c.mandatory ? (
                          <span className="font-medium text-foreground">Mandatory</span>
                        ) : (
                          <span className="text-muted-foreground">Guidance</span>
                        )}
                      </td>
                      <td className="px-3 py-2.5 text-xs text-muted-foreground">
                        {c.lastAssessed || "Not assessed"}
                      </td>
                      <td className="px-3 py-2.5">
                        <StatusPill status={c.assessmentStatus} compact />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <p className="mt-3 text-[10px] text-muted-foreground">
        INITIAL REFERENCE DATA — REVIEW AND APPROVAL REQUIRED. Applicability defaults are seeded per
        framework and are editable by authorized administrators. Conditional clauses apply only when
        the triggering scheme, scope or activity is present. Not Applicable exclusions require
        written justification, reviewer and approver.
      </p>
    </div>
  );
}
