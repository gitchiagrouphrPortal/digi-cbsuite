import { createFileRoute } from "@tanstack/react-router";
import { AppPageHeader, Card, DataTable, Pill, SectionTitle } from "@/components/app-primitives";

export const Route = createFileRoute("/app/admin/templates")({
  head: () => ({ meta: [{ title: "Notification Templates — DigiCB" }] }),
  component: Page,
});

const TEMPLATES = [
  {
    name: "Application Received",
    trigger: "Application submitted",
    channel: "Email + In-app",
    status: "Active",
  },
  { name: "Application Approved", trigger: "Review approved", channel: "Email", status: "Active" },
  {
    name: "Audit Scheduled",
    trigger: "Audit programme created",
    channel: "Email + In-app",
    status: "Active",
  },
  {
    name: "NCR Issued",
    trigger: "NCR status → issued",
    channel: "Email + In-app",
    status: "Active",
  },
  {
    name: "Certificate Issued",
    trigger: "Certificate published",
    channel: "Email",
    status: "Active",
  },
  {
    name: "Certificate Expiring",
    trigger: "30 days before expiry",
    channel: "Email + SMS",
    status: "Active",
  },
  {
    name: "Complaint Acknowledgement",
    trigger: "Complaint submitted",
    channel: "Email",
    status: "Active",
  },
  {
    name: "Authorization Expiring",
    trigger: "90 days before expiry",
    channel: "Email + In-app",
    status: "Active",
  },
  {
    name: "Document Review Due",
    trigger: "Next review date reached",
    channel: "In-app",
    status: "Active",
  },
  {
    name: "Transition Deadline",
    trigger: "Standard transition deadline",
    channel: "Email + In-app",
    status: "Draft",
  },
];

function Page() {
  return (
    <div>
      <AppPageHeader
        title="Notification Templates"
        description="Email, in-app, SMS and digest templates for every situation. Configurable with variables, scheduling and delivery/read tracking."
      />
      <Card>
        <SectionTitle>Templates</SectionTitle>
        <div className="mt-4">
          <DataTable
            headers={["Template", "Trigger", "Channel", "Status"]}
            rows={TEMPLATES.map((t) => [
              <span className="font-medium text-foreground">{t.name}</span>,
              <span className="text-muted-foreground">{t.trigger}</span>,
              <Pill tone="info">{t.channel}</Pill>,
              <Pill tone={t.status === "Active" ? "success" : "muted"}>{t.status}</Pill>,
            ])}
          />
        </div>
      </Card>
    </div>
  );
}
