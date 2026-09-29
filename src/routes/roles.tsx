import { createFileRoute } from "@tanstack/react-router";
import { PageShell, PageHeader, SectionCard, ExportBar } from "@/components/page-primitives";
import { PermCell } from "@/components/status-badges";
import { ROLES, PERMISSION_MATRIX } from "@/lib/digicb-data";

export const Route = createFileRoute("/roles")({
  head: () => ({
    meta: [
      { title: "Role-Permission Matrix — DigiCB" },
      {
        name: "description",
        content:
          "DigiCB configurable RBAC/ABAC matrix with segregation-of-duty enforcement across roles and modules.",
      },
      { property: "og:title", content: "Role-Permission Matrix — DigiCB" },
      {
        property: "og:description",
        content: "Configurable RBAC/ABAC matrix with segregation-of-duty enforcement.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: RolesRoute,
});

const AREAS = [
  "Org & tenants",
  "Users & roles",
  "Frameworks & schemes",
  "Document control",
  "CRM & applications",
  "Audit programme",
  "Certification decisions",
  "NCR & corrective action",
  "Competence & authorization",
  "Complaints & appeals",
  "KPIs & reports",
  "Settings & integrations",
];

const SOD = [
  "A person must not approve their own document.",
  "An auditor must not make the certification decision for the audit they performed.",
  "Complaint and appeal decisions must be independent of the activities being challenged.",
  "Certification decision-makers must be authorized for the applicable scheme and technical sector.",
  "Commercial personnel must not influence audit findings or certification decisions.",
  "Conflict-of-interest and impartiality checks must occur before assignments and decisions.",
];

function RolesRoute() {
  const roles = Object.keys(PERMISSION_MATRIX);
  return (
    <PageShell>
      <PageHeader
        eyebrow="Deliverable 04"
        title="Role-Permission Matrix"
        description="Configurable RBAC + ABAC across 24 roles, 12 areas and module/record/field/branch/scheme/action granularity."
      >
        <ExportBar />
      </PageHeader>

      <div className="space-y-6">
        <SectionCard title="Legend">
          <div className="flex flex-wrap items-center gap-6">
            <div className="flex items-center gap-2">
              <PermCell level="full" /> <span className="text-sm text-foreground">Full</span>
            </div>
            <div className="flex items-center gap-2">
              <PermCell level="branch" />{" "}
              <span className="text-sm text-foreground">Branch-scoped</span>
            </div>
            <div className="flex items-center gap-2">
              <PermCell level="read" /> <span className="text-sm text-foreground">Read</span>
            </div>
            <div className="flex items-center gap-2">
              <PermCell level="none" /> <span className="text-sm text-foreground">None</span>
            </div>
            <span className="text-xs text-muted-foreground">
              Full matrix shows a representative subset of {ROLES.length} configurable roles.
            </span>
          </div>
        </SectionCard>

        <SectionCard
          title="Permission matrix"
          description="Permissions are configurable at module, record, field, branch, scheme and action level."
        >
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-sm">
              <thead className="bg-muted">
                <tr>
                  <th className="sticky left-0 z-10 bg-muted px-4 py-3 text-left font-semibold text-foreground">
                    Role
                  </th>
                  {AREAS.map((a) => (
                    <th
                      key={a}
                      className="px-2 py-3 text-center font-semibold text-foreground"
                      title={a}
                    >
                      <span className="block w-7 truncate text-[10px]">{a}</span>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {roles.map((role) => (
                  <tr key={role} className="bg-card">
                    <td className="sticky left-0 z-10 bg-card px-4 py-3 font-medium text-foreground whitespace-nowrap">
                      {role}
                    </td>
                    {AREAS.map((a) => {
                      const level = PERMISSION_MATRIX[role]?.[a] ?? "none";
                      return (
                        <td key={a} className="px-2 py-3 text-center">
                          <PermCell level={level} />
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </SectionCard>

        <SectionCard
          title="Segregation-of-duty rules"
          description="Enforced by the SoD engine before assignments and decisions."
        >
          <ul className="space-y-2">
            {SOD.map((r, i) => (
              <li
                key={i}
                className="flex gap-3 rounded-lg border border-border bg-muted/40 p-3 text-sm text-foreground"
              >
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-destructive/15 text-xs font-bold text-destructive">
                  {i + 1}
                </span>
                {r}
              </li>
            ))}
          </ul>
        </SectionCard>
      </div>
    </PageShell>
  );
}
