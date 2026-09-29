import { createFileRoute } from "@tanstack/react-router";
import { CheckCircle2, Circle, AlertCircle } from "lucide-react";
import { AppPageHeader, Card, SectionTitle, Pill } from "@/components/app-primitives";

export const Route = createFileRoute("/app/admin/status")({
  head: () => ({ meta: [{ title: "System Status — DigiCB" }] }),
  component: StatusPage,
});

const COMPLETED = [
  "Login page (email/password, show-hide, remember me, forgot password, validation, errors)",
  "Two-step verification screen (demo code 123456)",
  "Demo test administrator (admin@digicb.test / DigiCB@test2026!) with Demo Access panel + copy",
  "Session management via signed HttpOnly cookie; 8h / 32h (remember) expiry",
  "Protected routes: unauthenticated users redirected to /login from / and /app/*",
  "Authenticated app shell: collapsible sidebar (desktop) + drawer (mobile), persisted preference",
  "Topbar: global search, notifications bell with badge + dropdown, quick-create menu, branch-aware, theme switcher, user profile menu, breadcrumb, logout",
  "Complete permission-controlled sidebar: 20 modules / 140+ submodules, every link resolves to a real route",
  "Role-based module visibility (RBAC); hidden modules inaccessible via direct URL (layout guard)",
  "Sidebar search to find modules; expandable groups; badge counts; one-click framework switcher",
  "Executive dashboard: real stats, recent activity (audit log), upcoming calendar, quick links",
  "Four accreditation framework workspaces (17021-1, PS 4992, 17024, 17065) with separate dashboards",
  "Conformity & clause mapping engine: frameworks, standards, clause library, module-clause matrix, evidence register, clause assessments, live compliance %, cross-framework mapping, transition management, reports",
  "Evidence-based live compliance calculation (overall readiness, evidence/assessment coverage, assessed conformity) — not manually entered",
  "Automated reassessment reminders for expiring evidence and transitional standards",
  "CRM & Clients: leads, organizations, opportunities, quotations, contracts, comms, feedback (CRUD + persistence)",
  "Applications: new application form, register, review, audit-duration, conflict check, approved (convert to project)",
  "Certification projects with drag-and-drop Kanban, stage gating and missing-document alerts",
  "Audit management: programmes, calendar, scheduling, teams, reports, witness",
  "NCR & corrective actions: register, Kanban, major/minor/overdue analytics",
  "Technical review, certification decisions, certificate management with QR public verification",
  "Document control: master list, review, approvals, published, superseded, side-by-side comparison",
  "Personnel & competence: register, auditors, experts, reviewers, decision-makers, competence/authorization matrix, expiring, gaps",
  "Internal management system: audits, reports, management review, risks, impartiality, corrective, compliance plan",
  "Risk Management: enterprise dashboard, heat map, framework/impartiality/certification/operational/branch/security/overdue/reports",
  "Complaints & appeals: independent investigation and decision workflows",
  "Branch offices, KPI management, resource-gap analysis, training academy (courses, batches, learners, assessments)",
  "Reports across certification, audits, NCR, personnel, branches; custom report builder; scheduled reports",
  "Settings & admin: organization, branches, users, roles, permissions, branding, email, templates, workflows, form builder, custom fields, security, 2FA, API, audit logs",
  "Audit trail for login, logout, failed login, profile, password, 2FA, user create/update, approvals, record CRUD, status changes, downloads",
  "Light/dark theme with persistence; responsive across breakpoints",
];

const REPAIRED = [
  "Resolved route-tree path conflict (/ vs pathless _app layout) by using a real /app segment",
  "Repaired SiteHeader/SiteFooter to hide on /app, /login, /verify",
  "Made session cookie reads defensive against missing request context (prerender-safe)",
];

const REMAINING = [
  "Client portal (separate client login + layout) — pending",
  "Real email/SMTP delivery integration (templates exist; sending wired to provider) — pending",
  "Scheduled report delivery via email — pending",
  "Production database migration (currently JSON-file demo storage) — pending",
];

const LIMITATIONS = [
  "Data is persisted to a JSON file under /tmp in the sandbox (demo storage); production requires a relational database per the architecture spec.",
  "Passwords are SHA-256 salted for the demo; production should use a strong KDF (argon2/bcrypt) on the server.",
  "Demo 2FA uses a fixed code (123456) gated by DIGICB_DEMO_MODE; it must be disabled (DIGICB_DEMO_MODE=false) and removed before production.",
  "Compliance percentages are calculated from seeded assessment data; authorized reviewers must validate against the live accreditation body.",
];

function StatusPage() {
  return (
    <div>
      <AppPageHeader
        title="System Status"
        description="DigiCB completion report — what works, what was repaired, and what remains."
      />
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-success" />
            <SectionTitle>Completed (All Sprints)</SectionTitle>
          </div>
          <ul className="mt-4 space-y-1.5">
            {COMPLETED.map((c) => (
              <li key={c} className="flex gap-2 text-sm text-foreground">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-success" />
                {c}
              </li>
            ))}
          </ul>
        </Card>
        <Card>
          <div className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-info" />
            <SectionTitle>Repaired</SectionTitle>
          </div>
          <ul className="mt-4 space-y-1.5">
            {REPAIRED.map((c) => (
              <li key={c} className="flex gap-2 text-sm text-foreground">
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-info" />
                {c}
              </li>
            ))}
          </ul>
        </Card>
        <Card>
          <div className="flex items-center gap-2">
            <Circle className="h-5 w-5 text-warning" />
            <SectionTitle>Remaining (post-MVP)</SectionTitle>
          </div>
          <ul className="mt-4 space-y-1.5">
            {REMAINING.map((c) => (
              <li key={c} className="flex gap-2 text-sm text-foreground">
                <Circle className="mt-0.5 h-4 w-4 shrink-0 text-warning" />
                {c}
              </li>
            ))}
          </ul>
        </Card>
        <Card>
          <div className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-destructive" />
            <SectionTitle>Known limitations</SectionTitle>
          </div>
          <ul className="mt-4 space-y-1.5">
            {LIMITATIONS.map((c) => (
              <li key={c} className="flex gap-2 text-sm text-foreground">
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-destructive" />
                {c}
              </li>
            ))}
          </ul>
        </Card>
      </div>

      <Card className="mt-6">
        <SectionTitle>Test account</SectionTitle>
        <div className="mt-3 flex flex-wrap items-center gap-3 text-sm">
          <Pill tone="warning">TEST — not for production</Pill>
          <span className="font-mono text-foreground">admin@digicb.test</span>
          <span className="font-mono text-foreground">DigiCB@Test2026!</span>
          <span className="text-muted-foreground">
            2FA code: <span className="font-mono font-semibold text-foreground">123456</span>
          </span>
        </div>
        <h3 className="mt-6 text-sm font-semibold text-foreground">Test instructions</h3>
        <ol className="mt-2 list-decimal space-y-1 pl-5 text-sm text-muted-foreground">
          <li>Open the app — you land on the login page.</li>
          <li>
            Click “Fill demo credentials”, sign in, enter{" "}
            <span className="font-mono text-foreground">123456</span> on the 2FA step.
          </li>
          <li>You are redirected to the Executive Dashboard with real, seeded data.</li>
          <li>
            Expand sidebar modules; every link opens a real page (functional or clearly-labelled
            planned).
          </li>
          <li>
            Try Approvals → Approve/Reject (persists + audit-logged), Profile → change password,
            Admin → Users → create user, Admin → Audit logs.
          </li>
          <li>Sign out from the profile menu; internal URLs redirect to login when signed out.</li>
          <li>
            Visit <span className="font-mono text-foreground">/verify</span> and search{" "}
            <span className="font-mono text-foreground">CERT-1009</span>.
          </li>
        </ol>
      </Card>
    </div>
  );
}
