import { createFileRoute } from "@tanstack/react-router";
import { AppPageHeader, Card, EmptyState, DataTable, Pill } from "@/components/app-primitives";

export const Route = createFileRoute("/app/reports/scheduled")({
  head: () => ({ meta: [{ title: "Scheduled Reports — DigiCB" }] }),
  component: Page,
});

const SCHEDULED = [
  {
    name: "Weekly Certification Pipeline",
    recipients: "Certification Manager",
    frequency: "Weekly",
    format: "PDF",
    next: "Mon 09:00",
  },
  {
    name: "Monthly NCR Aging",
    recipients: "Quality Manager",
    frequency: "Monthly",
    format: "Excel",
    next: "1st 09:00",
  },
  {
    name: "Quarterly Branch Performance",
    recipients: "CEO, Branch Managers",
    frequency: "Quarterly",
    format: "PDF",
    next: "Q4 start",
  },
  {
    name: "Daily Overdue NCR Alert",
    recipients: "Audit Program Manager",
    frequency: "Daily",
    format: "Email",
    next: "08:00",
  },
];

function Page() {
  return (
    <div>
      <AppPageHeader
        title="Scheduled Reports"
        description="Automated report delivery with filters, saved views, role-based access and export history."
      />
      {SCHEDULED.length === 0 ? (
        <EmptyState title="No scheduled reports" body="" />
      ) : (
        <DataTable
          headers={["Report", "Recipients", "Frequency", "Format", "Next Run"]}
          rows={SCHEDULED.map((r) => [
            <span className="font-medium text-foreground">{r.name}</span>,
            <span className="text-muted-foreground">{r.recipients}</span>,
            <Pill tone="info">{r.frequency}</Pill>,
            <Pill tone="muted">{r.format}</Pill>,
            <span className="text-muted-foreground">{r.next}</span>,
          ])}
        />
      )}
    </div>
  );
}
