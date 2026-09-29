import { createFileRoute } from "@tanstack/react-router";
import { PageShell, PageHeader, SectionCard, ExportBar } from "@/components/page-primitives";
import { MODULES, FRAMEWORKS } from "@/lib/digicb-data";

export const Route = createFileRoute("/modules")({
  head: () => ({
    meta: [
      { title: "Module Map — DigiCB" },
      {
        name: "description",
        content:
          "DigiCB module map: 28 functional modules grouped and mapped across the four accreditation frameworks.",
      },
      { property: "og:title", content: "Module Map — DigiCB" },
      {
        property: "og:description",
        content: "28 functional modules mapped across four accreditation frameworks.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ModulesRoute,
});

const FRAMEWORK_LABEL: Record<string, string> = Object.fromEntries(
  FRAMEWORKS.map((f) => [f.id, f.code]),
);

const GROUPS = ["Core", "Lifecycle", "Compliance", "Governance", "Academy", "Platform"];

function ModulesRoute() {
  return (
    <PageShell>
      <PageHeader
        eyebrow="Deliverable 03"
        title="Module Map"
        description="28 functional modules grouped by domain and mapped across the four accreditation frameworks."
      >
        <ExportBar />
      </PageHeader>

      <div className="space-y-6">
        <SectionCard
          title="Framework applicability legend"
          description="Modules apply per framework; applicability is configurable per scheme."
        >
          <div className="flex flex-wrap gap-2">
            {FRAMEWORKS.map((f) => (
              <span
                key={f.id}
                className="inline-flex items-center gap-2 rounded-md border border-border bg-muted px-3 py-1.5"
              >
                <span className="h-2.5 w-2.5 rounded-full bg-primary" />
                <span className="font-mono text-xs font-semibold text-foreground">{f.code}</span>
                <span className="text-xs text-muted-foreground">{f.name}</span>
              </span>
            ))}
          </div>
        </SectionCard>

        {GROUPS.map((group) => {
          const mods = MODULES.filter((m) => m.group === group);
          if (!mods.length) return null;
          return (
            <SectionCard
              key={group}
              title={group}
              description={`${mods.length} module${mods.length > 1 ? "s" : ""}.`}
            >
              <div className="overflow-hidden rounded-lg border border-border">
                <table className="w-full text-left text-sm">
                  <thead className="bg-muted">
                    <tr>
                      <th className="px-4 py-3 font-semibold text-foreground">Module</th>
                      <th className="px-4 py-3 font-semibold text-foreground">
                        Applicable frameworks
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {mods.map((m) => (
                      <tr key={m.id} className="bg-card">
                        <td className="px-4 py-3 font-medium text-foreground">{m.name}</td>
                        <td className="px-4 py-3">
                          <div className="flex flex-wrap gap-1.5">
                            {m.frameworks.map((fid) => (
                              <span
                                key={fid}
                                className="rounded border border-primary/20 bg-primary/10 px-2 py-0.5 font-mono text-[10px] font-semibold text-primary"
                              >
                                {FRAMEWORK_LABEL[fid]}
                              </span>
                            ))}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </SectionCard>
          );
        })}
      </div>
    </PageShell>
  );
}
