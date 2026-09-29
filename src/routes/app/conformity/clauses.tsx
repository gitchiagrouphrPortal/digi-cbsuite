import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Link } from "@tanstack/react-router";
import { listClausesFn, listStandardsFn, listFrameworksFn } from "@/lib/conformity.functions";
import type { ClauseDTO, StandardDTO, FrameworkDTO } from "@/lib/conformity-schema";
import { AppPageHeader, Card, EmptyState, SectionTitle } from "@/components/app-primitives";
import { StatusPill, ComplianceBadge } from "@/components/conformity-ui";
import { ChevronRight, ChevronDown, FileText, Search } from "lucide-react";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/app/conformity/clauses")({
  head: () => ({
    meta: [
      { title: "Clause Library — DigiCB" },
      { name: "description", content: "Hierarchical clause library for accreditation standards." },
    ],
  }),
  component: Page,
});

function Page() {
  const getClauses = useServerFn(listClausesFn);
  const getStandards = useServerFn(listStandardsFn);
  const getFws = useServerFn(listFrameworksFn);
  const [clauses, setClauses] = useState<ClauseDTO[]>([]);
  const [standards, setStandards] = useState<StandardDTO[]>([]);
  const [frameworks, setFrameworks] = useState<FrameworkDTO[]>([]);
  const [fwFilter, setFwFilter] = useState("all");
  const [stdFilter, setStdFilter] = useState("all");
  const [query, setQuery] = useState("");
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [selected, setSelected] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let a = true;
    (async () => {
      setLoading(true);
      try {
        const [c, s, f] = await Promise.all([getClauses(), getStandards(), getFws()]);
        if (!a) return;
        setClauses(c);
        setStandards(s);
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
  }, [getClauses, getStandards, getFws]);

  const filtered = useMemo(() => {
    let r = clauses;
    if (fwFilter !== "all") r = r.filter((c) => c.frameworkId === fwFilter);
    if (stdFilter !== "all") r = r.filter((c) => c.standardId === stdFilter);
    if (query.trim()) {
      const q = query.toLowerCase();
      r = r.filter((c) => c.number.toLowerCase().includes(q) || c.title.toLowerCase().includes(q));
    }
    return r;
  }, [clauses, fwFilter, stdFilter, query]);

  // Build tree from filtered flat list
  const tree = useMemo(() => buildTree(filtered), [filtered]);
  const selectedClause = clauses.find((c) => c.id === selected) ?? null;

  const toggle = (id: string) => setExpanded((e) => ({ ...e, [id]: !e[id] }));

  return (
    <div>
      <AppPageHeader
        title="Clause Library"
        description="Hierarchical accreditation clauses. Select a clause to view its requirement, linked modules and evidence."
      >
        <Link
          to="/app/conformity/matrix"
          className="inline-flex h-9 items-center gap-1.5 rounded-md border border-input bg-background px-3 text-sm font-medium text-foreground hover:bg-accent"
        >
          Module-Clause Matrix
        </Link>
      </AppPageHeader>

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
            onChange={(e) => {
              setFwFilter(e.target.value);
              setStdFilter("all");
            }}
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
            value={stdFilter}
            onChange={(e) => setStdFilter(e.target.value)}
            className="rounded-md border border-input bg-background px-3 py-1.5 text-sm"
          >
            <option value="all">All Standards</option>
            {standards
              .filter((s) => fwFilter === "all" || s.frameworkId === fwFilter)
              .map((s) => (
                <option key={s.id} value={s.id}>
                  {s.number} — {s.title}
                </option>
              ))}
          </select>
        </div>
      </Card>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <SectionTitle>Clause Tree</SectionTitle>
          {loading ? (
            <p className="py-6 text-center text-sm text-muted-foreground">Loading clauses…</p>
          ) : tree.length === 0 ? (
            <EmptyState
              title="No clauses found"
              body="Adjust filters or add clauses via the Standards Register."
            />
          ) : (
            <div className="mt-3 max-h-[600px] overflow-y-auto">
              {tree.map((n) => (
                <TreeNode
                  key={n.id}
                  node={n}
                  depth={0}
                  expanded={expanded}
                  toggle={toggle}
                  selected={selected}
                  onSelect={setSelected}
                />
              ))}
            </div>
          )}
        </Card>

        <Card>
          <SectionTitle>Clause Detail</SectionTitle>
          {!selectedClause ? (
            <EmptyState
              title="No clause selected"
              body="Select a clause from the tree to view its requirement, applicability and linked modules."
            />
          ) : (
            <div className="mt-3 space-y-3 text-sm">
              <div>
                <p className="font-mono text-xs text-muted-foreground">{selectedClause.number}</p>
                <p className="font-display text-base font-bold text-foreground">
                  {selectedClause.title}
                </p>
              </div>
              <div className="flex flex-wrap gap-1.5">
                <StatusPill status={selectedClause.assessmentStatus} />
                <ComplianceBadge pct={selectedClause.complianceScore} />
              </div>
              <Field label="Requirement Summary" value={selectedClause.requirementSummary || "—"} />
              <Field label="Applicability" value={selectedClause.applicability || "—"} />
              <Field label="Mandatory" value={selectedClause.mandatory ? "Yes" : "Guidance"} />
              <Field label="Responsible Process" value={selectedClause.responsibleProcess || "—"} />
              <Field
                label="Required Evidence Types"
                value={selectedClause.requiredEvidenceTypes?.join(", ") || "—"}
              />
              <Field label="Last Assessed" value={selectedClause.lastAssessed || "Not assessed"} />
              <Field label="Next Assessment" value={selectedClause.nextAssessment || "—"} />
              <div className="pt-2">
                <Link
                  to="/app/conformity/assessments"
                  className="text-sm font-medium text-primary hover:underline"
                >
                  View assessments & evidence →
                </Link>
              </div>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
        {label}
      </p>
      <p className="text-foreground">{value}</p>
    </div>
  );
}

interface TreeNode_ {
  id: string;
  number: string;
  title: string;
  status: string;
  score: number;
  children: TreeNode_[];
}

function buildTree(flat: ClauseDTO[]): TreeNode_[] {
  const map = new Map<string, TreeNode_>();
  const roots: TreeNode_[] = [];
  for (const c of flat) {
    map.set(c.id, {
      id: c.id,
      number: c.number,
      title: c.title,
      status: c.assessmentStatus,
      score: c.complianceScore,
      children: [],
    });
  }
  for (const c of flat) {
    const node = map.get(c.id)!;
    if (c.parentId && map.has(c.parentId)) {
      map.get(c.parentId)!.children.push(node);
    } else {
      roots.push(node);
    }
  }
  return roots;
}

function TreeNode({
  node,
  depth,
  expanded,
  toggle,
  selected,
  onSelect,
}: {
  node: TreeNode_;
  depth: number;
  expanded: Record<string, boolean>;
  toggle: (id: string) => void;
  selected: string | null;
  onSelect: (id: string) => void;
}) {
  const isOpen = expanded[node.id];
  const hasChildren = node.children.length > 0;
  const isSel = selected === node.id;
  return (
    <div>
      <div
        className={cn(
          "flex items-center gap-1.5 rounded-md py-1.5 pr-2 text-sm hover:bg-muted/50",
          isSel && "bg-primary/10",
        )}
        style={{ paddingLeft: depth * 16 + 4 }}
      >
        {hasChildren ? (
          <button onClick={() => toggle(node.id)} className="shrink-0 text-muted-foreground">
            {isOpen ? (
              <ChevronDown className="h-3.5 w-3.5" />
            ) : (
              <ChevronRight className="h-3.5 w-3.5" />
            )}
          </button>
        ) : (
          <FileText className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
        )}
        <button
          onClick={() => onSelect(node.id)}
          className="flex flex-1 items-center gap-2 text-left"
        >
          <span className="font-mono text-xs font-semibold text-primary">{node.number}</span>
          <span className="truncate text-foreground">{node.title}</span>
        </button>
        <StatusPill status={node.status} compact />
      </div>
      {isOpen &&
        hasChildren &&
        node.children.map((ch) => (
          <TreeNode
            key={ch.id}
            node={ch}
            depth={depth + 1}
            expanded={expanded}
            toggle={toggle}
            selected={selected}
            onSelect={onSelect}
          />
        ))}
    </div>
  );
}
