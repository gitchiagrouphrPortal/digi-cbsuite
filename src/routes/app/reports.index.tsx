import { createFileRoute, Link } from "@tanstack/react-router";
import { AppPageHeader, Card, DataTable, Pill } from "@/components/app-primitives";

export const Route = createFileRoute("/app/reports/")({
  head: () => ({ meta: [{ title: "Reports Summary — DigiCB" }] }),
  component: ReportsPage,
});

const REPORTS = [
  {
    name: "Certification pipeline",
    area: "Certification",
    status: "Available",
    to: "/app/reports/certification",
  },
  {
    name: "Audit programmes & duration",
    area: "Audits",
    status: "Available",
    to: "/app/reports/audits",
  },
  { name: "NCR status & aging", area: "NCR", status: "Available", to: "/app/reports/ncr" },
  {
    name: "Competence & authorization",
    area: "Personnel",
    status: "Available",
    to: "/app/reports/personnel",
  },
  {
    name: "Branch performance",
    area: "Branches",
    status: "Available",
    to: "/app/reports/branches",
  },
  {
    name: "Custom report builder",
    area: "Analytics",
    status: "Available",
    to: "/app/reports/custom",
  },
  {
    name: "Scheduled reports",
    area: "Automation",
    status: "Available",
    to: "/app/reports/scheduled",
  },
  {
    name: "User access & audit logs",
    area: "Security",
    status: "Available",
    to: "/app/admin/audit",
  },
];

function ReportsPage() {
  return (
    <div>
      <AppPageHeader
        title="Reports Summary"
        description="Configurable PDF, spreadsheet and dashboard reports with saved views and scheduled delivery."
      />
      <Card>
        <DataTable
          headers={["Report", "Area", "Status", "Open"]}
          rows={REPORTS.map((r) => [
            <Link
              to={r.to as "/app/reports/certification"}
              className="font-medium text-primary hover:underline"
            >
              {r.name}
            </Link>,
            <span className="text-muted-foreground">{r.area}</span>,
            <Pill tone="success">{r.status}</Pill>,
            <Link
              to={r.to as "/app/reports/certification"}
              className="text-xs font-semibold text-primary hover:underline"
            >
              View →
            </Link>,
          ])}
        />
      </Card>
    </div>
  );
}
