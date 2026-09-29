import { createFileRoute } from "@tanstack/react-router";
import { AppPageHeader, Card, DataTable, Pill, SectionTitle } from "@/components/app-primitives";

export const Route = createFileRoute("/app/admin/api")({
  head: () => ({ meta: [{ title: "API & Webhooks — DigiCB" }] }),
  component: Page,
});

const KEYS = [
  {
    name: "CRM Sync",
    scope: "read:clients, read:applications",
    created: "2026-01-15",
    lastUsed: "2026-09-19",
    status: "Active",
  },
  {
    name: "Finance Export",
    scope: "read:invoices",
    created: "2026-03-01",
    lastUsed: "2026-09-18",
    status: "Active",
  },
  {
    name: "Legacy Integration",
    scope: "read:certificates",
    created: "2025-06-10",
    lastUsed: "2026-08-01",
    status: "Revoked",
  },
];

const WEBHOOKS = [
  { event: "certificate.issued", url: "https://erp.example.com/hooks/cert", status: "Active" },
  { event: "ncr.issued", url: "https://qa.example.com/hooks/ncr", status: "Active" },
  { event: "application.submitted", url: "https://crm.example.com/hooks/app", status: "Active" },
];

function Page() {
  return (
    <div>
      <AppPageHeader
        title="API & Webhooks"
        description="Versioned REST/GraphQL API keys, webhook endpoints and integration settings. Credentials are server-managed."
      />
      <Card className="mb-6">
        <SectionTitle>API keys</SectionTitle>
        <div className="mt-4">
          <DataTable
            headers={["Name", "Scope", "Created", "Last used", "Status"]}
            rows={KEYS.map((k) => [
              <span className="font-medium text-foreground">{k.name}</span>,
              <span className="font-mono text-xs text-muted-foreground">{k.scope}</span>,
              <span className="text-muted-foreground">{k.created}</span>,
              <span className="text-muted-foreground">{k.lastUsed}</span>,
              <Pill tone={k.status === "Active" ? "success" : "muted"}>{k.status}</Pill>,
            ])}
          />
        </div>
      </Card>
      <Card>
        <SectionTitle>Webhooks</SectionTitle>
        <div className="mt-4">
          <DataTable
            headers={["Event", "Endpoint", "Status"]}
            rows={WEBHOOKS.map((w) => [
              <span className="font-mono text-xs font-semibold text-foreground">{w.event}</span>,
              <span className="text-muted-foreground">{w.url}</span>,
              <Pill tone={w.status === "Active" ? "success" : "muted"}>{w.status}</Pill>,
            ])}
          />
        </div>
      </Card>
    </div>
  );
}
