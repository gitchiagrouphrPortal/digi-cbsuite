import { createFileRoute } from "@tanstack/react-router";
import { PageShell, PageHeader, SectionCard, ExportBar } from "@/components/page-primitives";

export const Route = createFileRoute("/architecture")({
  head: () => ({
    meta: [
      { title: "Architecture Proposal — DigiCB" },
      {
        name: "description",
        content:
          "DigiCB architecture: multi-tenant, API-first design, ERD overview, security and threat model.",
      },
      { property: "og:title", content: "Architecture Proposal — DigiCB" },
      {
        property: "og:description",
        content: "Multi-tenant, API-first architecture with ERD overview and security model.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ArchitectureRoute,
});

const LAYERS = [
  {
    name: "Presentation",
    tech: "Responsive web app (React), role-specific dashboards, portals",
    color: "primary",
  },
  {
    name: "API Gateway",
    tech: "Versioned REST/GraphQL, auth, rate limiting, tenant routing",
    color: "info",
  },
  {
    name: "Domain Services",
    tech: "CRM, Applications, Audit, NCR, Documents, Competence, Training, Reports",
    color: "primary",
  },
  {
    name: "Background Jobs",
    tech: "Notifications, scheduled reminders, escalations, report generation, backup tests",
    color: "info",
  },
  {
    name: "Data Layer",
    tech: "Relational DB (tenant-scoped), secure object storage, search index",
    color: "primary",
  },
  {
    name: "Integrations",
    tech: "Email/SMTP, calendars, webhooks, AI advisory (read-only)",
    color: "info",
  },
];

const ENTITIES = [
  "Organizations",
  "Branches",
  "Users",
  "Roles",
  "Permissions",
  "Frameworks",
  "Standards",
  "Clauses",
  "Schemes",
  "Accreditation scopes",
  "Clients",
  "Sites",
  "Applications",
  "Application reviews",
  "Contracts",
  "Projects",
  "Workflow stages",
  "Audit programmes",
  "Audits",
  "Audit team assignments",
  "Findings",
  "NCRs",
  "Corrective actions",
  "Reviews",
  "Decisions",
  "Certificates",
  "Documents",
  "Document versions",
  "Approvals",
  "Personnel",
  "Competencies",
  "Authorizations",
  "Training",
  "Complaints",
  "Appeals",
  "Risks",
  "Internal audits",
  "Management reviews",
  "KPIs",
  "Notifications",
  "Communications",
  "Activities",
  "Audit logs",
];

const THREATS = [
  {
    threat: "Cross-tenant data leakage",
    control:
      "Tenant ID on every record + row-level isolation; query middleware enforces scope; tested isolation suite.",
  },
  {
    threat: "Privilege escalation",
    control:
      "RBAC + ABAC at module/record/field/branch/scheme/action; SoD engine; immutable permission-change logs.",
  },
  {
    threat: "Autonomous AI certification decision",
    control:
      "AI is advisory only; every decision/approval/NCR closure requires a human e-signature.",
  },
  {
    threat: "Credential compromise",
    control:
      "Mandatory 2FA, SSO, lockout, session timeout, device management, suspicious-login alerts.",
  },
  {
    threat: "Malicious uploads",
    control: "Malware scanning on upload; file-type allow-list; object storage isolation.",
  },
  {
    threat: "Data loss",
    control: "Encrypted backups + tested restoration; retention & secure-deletion rules.",
  },
  {
    threat: "Audit-trail tampering",
    control: "Append-only audit logs; download/export/sensitive-access all logged.",
  },
];

function ArchitectureRoute() {
  return (
    <PageShell>
      <PageHeader
        eyebrow="Deliverable 02"
        title="Architecture Proposal"
        description="Modular, API-first, multi-tenant architecture with ERD overview, security model and audit-trail design."
      >
        <ExportBar />
      </PageHeader>

      <div className="space-y-6">
        <SectionCard
          title="Layered architecture"
          description="Logical layers with responsibility and key technologies."
        >
          <div className="space-y-2">
            {LAYERS.map((l, i) => (
              <div key={l.name} className="flex items-center gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 font-mono text-sm font-bold text-primary">
                  L{i + 1}
                </div>
                <div className="flex flex-1 flex-col rounded-lg border border-border bg-card p-3 sm:flex-row sm:items-center sm:justify-between">
                  <span className="font-semibold text-foreground">{l.name}</span>
                  <span className="text-sm text-muted-foreground">{l.tech}</span>
                </div>
              </div>
            ))}
          </div>
        </SectionCard>

        <SectionCard
          title="Entity-relationship overview"
          description="Core data entities (44). All carry unique IDs, tenant ID, and created/updated metadata with soft-delete/archival."
        >
          <div className="flex flex-wrap gap-2">
            {ENTITIES.map((e) => (
              <span
                key={e}
                className="rounded-md border border-border bg-muted px-2.5 py-1 text-xs font-medium text-foreground"
              >
                {e}
              </span>
            ))}
          </div>
          <div className="mt-6 overflow-x-auto">
            <div className="flex items-stretch gap-4 text-xs">
              <div className="flex-1 rounded-lg border border-primary/30 bg-primary/5 p-4">
                <p className="mb-2 font-semibold text-primary">Tenancy & identity</p>
                <p className="text-muted-foreground">
                  Organizations → Branches → Users → Roles → Permissions (tenant_id enforced
                  throughout)
                </p>
              </div>
              <div className="hidden items-center text-muted-foreground sm:flex">→</div>
              <div className="flex-1 rounded-lg border border-info/30 bg-info/5 p-4">
                <p className="mb-2 font-semibold text-info">Certification lifecycle</p>
                <p className="text-muted-foreground">
                  Clients → Applications → Projects → Audits → Findings → NCRs → Decisions →
                  Certificates
                </p>
              </div>
              <div className="hidden items-center text-muted-foreground sm:flex">→</div>
              <div className="flex-1 rounded-lg border border-success/30 bg-success/5 p-4">
                <p className="mb-2 font-semibold text-success">Control & competence</p>
                <p className="text-muted-foreground">
                  Documents → Versions → Approvals · Personnel → Competencies → Authorizations
                </p>
              </div>
            </div>
          </div>
        </SectionCard>

        <SectionCard
          title="Security & threat model"
          description="Top threats and engineered controls."
        >
          <div className="overflow-hidden rounded-lg border border-border">
            <table className="w-full text-left text-sm">
              <thead className="bg-muted">
                <tr>
                  <th className="px-4 py-3 font-semibold text-foreground">Threat</th>
                  <th className="px-4 py-3 font-semibold text-foreground">Control</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {THREATS.map((t) => (
                  <tr key={t.threat} className="bg-card">
                    <td className="px-4 py-3 align-top font-medium text-foreground">{t.threat}</td>
                    <td className="px-4 py-3 align-top text-muted-foreground">{t.control}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </SectionCard>

        <SectionCard title="Audit-trail design" description="Append-only, immutable, attributed.">
          <ul className="space-y-2 text-sm text-foreground">
            {[
              "Every permission change, approval, e-signature, download, export and sensitive-record access is logged.",
              "Log entries carry actor, tenant, action, before/after diff, timestamp and request context.",
              "Logs are append-only and retained per configurable retention period; tampering is itself detectable.",
              "Audit logs are exportable (Word/Excel/PDF) for accreditation-body review with read-only assessor scope.",
            ].map((l, i) => (
              <li key={i} className="flex gap-3">
                <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                {l}
              </li>
            ))}
          </ul>
        </SectionCard>
      </div>
    </PageShell>
  );
}
