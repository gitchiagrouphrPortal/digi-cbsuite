import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Link } from "@tanstack/react-router";
import { listStandardsFn, listFrameworksFn } from "@/lib/conformity.functions";
import type { StandardDTO, FrameworkDTO } from "@/lib/conformity-schema";
import { AppPageHeader, Card, EmptyState } from "@/components/app-primitives";
import { StatusPill } from "@/components/conformity-ui";
import { Search } from "lucide-react";

export const Route = createFileRoute("/app/conformity/mandatory-docs")({
  head: () => ({
    meta: [
      { title: "Mandatory Documents — DigiCB" },
      {
        name: "description",
        content:
          "IAF, Global ACI and accreditation-body mandatory documents with effective dates and supersession.",
      },
    ],
  }),
  component: Page,
});

function Page() {
  const get = useServerFn(listStandardsFn);
  const getFws = useServerFn(listFrameworksFn);
  const [items, setItems] = useState<StandardDTO[]>([]);
  const [frameworks, setFrameworks] = useState<FrameworkDTO[]>([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let a = true;
    (async () => {
      setLoading(true);
      try {
        const [s, f] = await Promise.all([get(), getFws()]);
        if (!a) return;
        setItems(s);
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
  }, [get, getFws]);

  // Mandatory documents are standards with "MD" or "mandatory" in number/title, plus IAF/Global ACI docs
  const mandatory = items.filter((s) =>
    /MD|mandatory|IAF|Global ACI|circular|policy/i.test(s.number + s.title),
  );
  const filtered = mandatory.filter(
    (s) => !query.trim() || (s.number + s.title).toLowerCase().includes(query.toLowerCase()),
  );

  return (
    <div>
      <AppPageHeader
        title="Mandatory Documents"
        description="IAF, Global ACI and accreditation-body mandatory documents. Legacy IAF documents remain applicable until superseded by current Global ACI publications."
      >
        <Link
          to="/app/conformity/transition"
          className="inline-flex h-9 items-center gap-1.5 rounded-md border border-input bg-background px-3 text-sm font-medium text-foreground hover:bg-accent"
        >
          Transition Management
        </Link>
      </AppPageHeader>

      <Card className="mb-4">
        <div className="relative">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search mandatory documents…"
            className="w-full rounded-md border border-input bg-background py-1.5 pl-8 pr-3 text-sm outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
      </Card>

      <Card>
        {loading ? (
          <p className="py-6 text-center text-sm text-muted-foreground">Loading…</p>
        ) : filtered.length === 0 ? (
          <EmptyState
            title="No mandatory documents"
            body="Mandatory documents are seeded as standards with MD/IAF/Global ACI references."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left text-[11px] uppercase tracking-wide text-muted-foreground">
                  <th className="px-3 py-2">Document</th>
                  <th className="px-3 py-2">Title</th>
                  <th className="px-3 py-2">Framework</th>
                  <th className="px-3 py-2">Effective</th>
                  <th className="px-3 py-2">Transition Deadline</th>
                  <th className="px-3 py-2">Status</th>
                  <th className="px-3 py-2">Supersession</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((s) => {
                  const fw = frameworks.find((f) => f.id === s.frameworkId);
                  return (
                    <tr key={s.id} className="border-b border-border/60 hover:bg-muted/30">
                      <td className="px-3 py-2.5 font-mono text-xs font-semibold text-primary">
                        {s.number}
                      </td>
                      <td className="px-3 py-2.5 text-foreground">{s.title}</td>
                      <td className="px-3 py-2.5 text-xs text-muted-foreground">
                        {fw?.label ?? "—"}
                      </td>
                      <td className="px-3 py-2.5 text-xs text-muted-foreground">
                        {s.effectiveDate || "—"}
                      </td>
                      <td className="px-3 py-2.5 text-xs text-muted-foreground">
                        {s.transitionDeadline || "—"}
                      </td>
                      <td className="px-3 py-2.5">
                        <StatusPill status={s.status} compact />
                      </td>
                      <td className="px-3 py-2.5 text-xs text-muted-foreground">
                        {s.supersededBy
                          ? `→ ${s.supersededBy}`
                          : s.supersedes
                            ? `replaces ${s.supersedes}`
                            : "—"}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
