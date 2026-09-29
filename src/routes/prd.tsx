import { createFileRoute } from "@tanstack/react-router";
import { PageShell, PageHeader, SectionCard, ExportBar } from "@/components/page-primitives";

export const Route = createFileRoute("/prd")({
  head: () => ({
    meta: [
      { title: "Product Requirements — DigiCB" },
      {
        name: "description",
        content:
          "DigiCB product requirements document: scope, principles, functional requirements and acceptance criteria.",
      },
      { property: "og:title", content: "Product Requirements — DigiCB" },
      {
        property: "og:description",
        content: "DigiCB PRD: scope, principles, functional requirements and acceptance criteria.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: PRDRoute,
});

const PRINCIPLES = [
  "Human accountability — no AI feature may make a certification decision, approve a document, close an NCR or authorize personnel without an accountable human approval.",
  "Independence & segregation of duties — an auditor cannot make the certification decision for the audit they performed; complaint/appeal decisions are independent of the activity challenged.",
  "Configurability over hard-coding — frameworks, schemes, standards, mandatory documents, workflows, Kanban stages, forms and fields are master data, not source code.",
  "Version immutability — every document version is preserved; obsolete versions are watermarked and never silently overwritten.",
  "Tenant isolation — a user never accesses another tenant's records unless formally authorized; separate portals separate information appropriately.",
  "Auditability — every significant action is logged immutably: permission changes, approvals, electronic signatures, downloads, exports, sensitive-record access.",
];

const FUNCTIONAL = [
  {
    area: "Accreditation & regulatory library",
    req: "Manage four framework workspaces; controlled master data for standards, IAF/Global ACI mandatory documents with effective dates, supersession and transition alerts.",
  },
  {
    area: "Organization & multi-tenancy",
    req: "Head office, branches, remote/franchise offices, clients & multi-site; logically isolated tenants; seven portals.",
  },
  {
    area: "Roles, permissions & SoD",
    req: "Configurable RBAC + ABAC at module, record, field, branch, scheme and action level; enforced segregation of duties.",
  },
  {
    area: "Authentication & security",
    req: "Mandatory 2FA, SSO, lockout, session timeout, device management, encryption, malware scanning, rate limiting, audit trails.",
  },
  {
    area: "Dashboard & navigation",
    req: "Role-specific dashboard with tables, calendars, Kanban boards, charts, saved views, global search, exportable reports.",
  },
  {
    area: "CRM & applications",
    req: "Leads to opportunities to certification projects without re-entry; configurable application review with recorded justification.",
  },
  {
    area: "Certification project Kanban",
    req: "20-stage configurable workflow per framework with entry/exit criteria, mandatory documents, approvals, SLAs, e-signatures.",
  },
  {
    area: "Audit & assessment management",
    req: "Planning, team selection with competence & conflict checks, checklists, evidence, findings, reports; scheduling blocks for unauthorized/conflicting/overloaded auditors.",
  },
  {
    area: "NCR & corrective action",
    req: "13-stage NCR Kanban; full NCR record with classification, evidence, root cause, corrective action, verification, effectiveness, closure; aging & trend reports.",
  },
  {
    area: "Certification decision & certificates",
    req: "Independent technical review + decision; controlled certificates with QR verification; public verification page exposing only approved public info.",
  },
  {
    area: "Document control & central approval",
    req: "Lifecycle Draft→Archive; versioning, side-by-side comparison, supersession watermarks; central approval hub with review feedback and request-changes.",
  },
  {
    area: "Personnel competence & authorization",
    req: "Competence files, matrix mapping, authorization scope & expiry; auto-block unauthorized assignments.",
  },
  {
    area: "Internal management system",
    req: "Internal audits, management review, risks & opportunities, impartiality register, legal obligations, supplier & equipment control, annual compliance calendar.",
  },
  {
    area: "Complaints, appeals & feedback",
    req: "Public + client-portal submission; independent investigator & decision-maker; full lifecycle and trend analysis.",
  },
  {
    area: "KPI & performance",
    req: "Configurable KPIs for employees, auditors, branches, schemes, complaints, NCR closure, client satisfaction; evidence-based, never auto-reported as 100%.",
  },
  {
    area: "Resource-gap assessment",
    req: "Evidence-based readiness %, gap analysis and action plan before launching a new scheme.",
  },
  {
    area: "Training management (Academy)",
    req: "Course catalogue, batches, exams, question banks, examiner/invigilator controls, learner certificates with QR; impartiality from certification activities.",
  },
  {
    area: "Notifications & communications",
    req: "In-app, internal/external email with templates, reminders, escalation, digest, delivery/read status; configurable SMTP without credential exposure.",
  },
  {
    area: "Reports & analytics",
    req: "PDF/Excel/dashboard reports for all modules; filters, saved views, scheduled delivery, role-based access, export history.",
  },
  {
    area: "Settings & administration",
    req: "Org/branding, theme, domain/SMTP, user/role management, custom fields/objects/tags, workflow & form builders, number formats, retention, API keys & webhooks, security policies.",
  },
  {
    area: "Document export & header/footer",
    req: "Universal header/footer region applied to all document exports; MS Word, Excel and PDF export; pagination for all long documents.",
  },
];

const CRITICAL = [
  "All four accreditation frameworks can be configured independently.",
  "Every approval and certification decision is attributable to an authorized person.",
  "The system enforces independence and segregation of duties.",
  "Every document version remains retrievable; current and superseded versions can be compared.",
  "Certification and NCR workflows are visible through Kanban boards.",
  "Client and certification-body portals expose appropriately separated information.",
  "Unauthorized personnel cannot be assigned to audits, reviews or decisions.",
  "Two-factor authentication works for privileged accounts.",
  "Every significant action is audit-logged.",
  "Complaints and appeals have controlled, independent workflows.",
  "Annual activities generate reminders and escalations.",
  "Branch and employee KPIs are evidence-based.",
  "Resource gaps can be measured before launching a new scheme.",
  "Certificate status can be publicly verified without disclosing confidential information.",
  "Backup restoration is tested.",
  "The interface is responsive and accessible.",
  "Standards, scheme rules and mandatory documents can be updated without code changes.",
];

function PRDRoute() {
  return (
    <PageShell>
      <PageHeader
        eyebrow="Deliverable 01"
        title="Product Requirements Document"
        description="Scope, design principles, functional requirements and critical acceptance criteria for DigiCB."
      >
        <ExportBar />
      </PageHeader>

      <div className="space-y-6">
        <SectionCard
          title="1. Purpose & scope"
          description="What DigiCB is and what it must cover."
        >
          <p className="text-sm leading-relaxed text-foreground">
            DigiCB is a secure, multi-tenant, web-based Certification Body Management System
            providing an end-to-end digital operating system for an accredited conformity assessment
            body. It supports management-system certification, personnel certification, product
            certification, Halal certification, training, inspections and related
            conformity-assessment activities across the four primary accreditation frameworks.
          </p>
        </SectionCard>

        <SectionCard title="2. Design principles">
          <ul className="space-y-2">
            {PRINCIPLES.map((p, i) => (
              <li key={i} className="flex gap-3 text-sm leading-relaxed text-foreground">
                <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                {p}
              </li>
            ))}
          </ul>
        </SectionCard>

        <SectionCard
          title="3. Functional requirements"
          description="Module-level requirements derived from the 28 functional areas."
        >
          <div className="overflow-hidden rounded-lg border border-border">
            <table className="w-full text-left text-sm">
              <thead className="bg-muted">
                <tr>
                  <th className="px-4 py-3 font-semibold text-foreground">Area</th>
                  <th className="px-4 py-3 font-semibold text-foreground">Requirement</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {FUNCTIONAL.map((f) => (
                  <tr key={f.area} className="bg-card">
                    <td className="px-4 py-3 align-top font-medium text-foreground whitespace-nowrap">
                      {f.area}
                    </td>
                    <td className="px-4 py-3 align-top text-muted-foreground">{f.req}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </SectionCard>

        <SectionCard
          title="4. Critical acceptance criteria"
          description="DigiCB will not be considered complete unless all are satisfied."
        >
          <div className="grid gap-2.5 sm:grid-cols-2">
            {CRITICAL.map((c, i) => (
              <div key={i} className="flex gap-3 rounded-lg border border-border bg-muted/40 p-3">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-success/15 text-xs font-bold text-success">
                  {i + 1}
                </span>
                <span className="text-sm leading-relaxed text-foreground">{c}</span>
              </div>
            ))}
          </div>
        </SectionCard>
      </div>
    </PageShell>
  );
}
