import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Link } from "@tanstack/react-router";
import { listEvidenceFn, listClausesFn, listFrameworksFn } from "@/lib/conformity.functions";
import type { EvidenceDTO, ClauseDTO, FrameworkDTO } from "@/lib/conformity-schema";
import { AppPageHeader, Card, EmptyState } from "@/components/app-primitives";
import { StatusPill } from "@/components/conformity-ui";
import { Search, Download } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/app/conformity/evidence")({
  head: () => ({
    meta: [
      { title: "Evidence Register — DigiCB" },
      {
        name: "description",
        content: "Centralized register of conformity evidence supporting clause assessments.",
      },
    ],
  }),
  component: Page,
});

function Page() {
  const getEvidence = useServerFn(listEvidenceFn);
  const getClauses = useServerFn(listClausesFn);
  const getFws = useServerFn(listFrameworksFn);
  const [items, setItems] = useState<EvidenceDTO[]>([]);
  const [clauses, setClauses] = useState<ClauseDTO[]>([]);
  const [frameworks, setFrameworks] = useState<FrameworkDTO[]>([]);
  const [fwFilter, setFwFilter] = useState("all");
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let a = true;
    (async () => {
      setLoading(true);
      try {
        const [e, c, f] = await Promise.all([getEvidence(), getClauses(), getFws()]);
        if (!a) return;
        setItems(e);
        setClauses(c);
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
  }, [getEvidence, getClauses, getFws]);

  const filtered = useMemo(() => {
    return items.filter((e) => {
      if (fwFilter !== "all") {
        const linked = e.clauseIds.some(
          (cid) => clauses.find((c) => c.id === cid)?.frameworkId === fwFilter,
        );
        if (!linked) return false;
      }
      if (query.trim()) {
        const q = query.toLowerCase();
        return (
          e.title.toLowerCase().includes(q) ||
          e.evidenceType.toLowerCase().includes(q) ||
          e.sourceModule.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [items, clauses, fwFilter, query]);

  const exportCsv = () => {
    const header = [
      "Evidence ID",
      "Title",
      "Type",
      "Source Module",
      "Source Record",
      "Clauses",
      "Owner",
      "Approval",
      "Effective",
      "Expiry",
      "Validity",
    ];
    const lines = filtered.map((e) =>
      [
        e.id,
        e.title,
        e.evidenceType,
        e.sourceModule,
        e.sourceRecord ?? "",
        e.clauseIds.map((cid) => clauses.find((c) => c.id === cid)?.number ?? cid).join("; "),
        e.owner,
        e.approvalStatus,
        e.effectiveDate ?? "",
        e.expiryDate ?? "",
        e.validity,
      ]
        .map((v) => `"${String(v).replace(/"/g, '""')}"`)
        .join(","),
    );
    const csv = [header.join(","), ...lines].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "evidence-register.csv";
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Evidence exported as CSV");
  };

  return (
    <div>
      <AppPageHeader
        title="Evidence Register"
        description="Centralized evidence supporting clause conformity. One evidence item may support multiple clauses; each mapping is independently reviewable."
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
              placeholder="Search evidence…"
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

      <Card>
        {loading ? (
          <p className="py-6 text-center text-sm text-muted-foreground">Loading…</p>
        ) : filtered.length === 0 ? (
          <EmptyState title="No evidence" body="Evidence is seeded alongside clause assessments." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left text-[11px] uppercase tracking-wide text-muted-foreground">
                  <th className="px-3 py-2">Title</th>
                  <th className="px-3 py-2">Type</th>
                  <th className="px-3 py-2">Source</th>
                  <th className="px-3 py-2">Clauses</th>
                  <th className="px-3 py-2">Owner</th>
                  <th className="px-3 py-2">Validity</th>
                  <th className="px-3 py-2">Approval</th>
                  <th className="px-3 py-2">Expiry</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((e) => (
                  <tr key={e.id} className="border-b border-border/60 hover:bg-muted/30">
                    <td className="px-3 py-2.5 text-foreground">{e.title}</td>
                    <td className="px-3 py-2.5 text-xs text-muted-foreground">{e.evidenceType}</td>
                    <td className="px-3 py-2.5 text-xs text-muted-foreground">
                      {e.sourceModule}
                      {e.sourceRecord ? ` / ${e.sourceRecord}` : ""}
                    </td>
                    <td className="px-3 py-2.5 text-xs">
                      <div className="flex flex-wrap gap-1">
                        {e.clauseIds.slice(0, 3).map((cid) => {
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
                        {e.clauseIds.length > 3 && (
                          <span className="text-muted-foreground">+{e.clauseIds.length - 3}</span>
                        )}
                      </div>
                    </td>
                    <td className="px-3 py-2.5 text-xs text-muted-foreground">{e.owner}</td>
                    <td className="px-3 py-2.5">
                      <StatusPill
                        status={
                          e.validity === "valid"
                            ? "conforming"
                            : e.validity === "expired"
                              ? "evidence_expired"
                              : "evidence_missing"
                        }
                        compact
                      />
                    </td>
                    <td className="px-3 py-2.5">
                      <StatusPill
                        status={e.approvalStatus === "approved" ? "conforming" : "pending_review"}
                        compact
                      />
                    </td>
                    <td className="px-3 py-2.5 text-xs text-muted-foreground">
                      {e.expiryDate ?? "—"}
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
