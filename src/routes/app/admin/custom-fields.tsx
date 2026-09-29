import { createFileRoute } from "@tanstack/react-router";
import { AppPageHeader, Card, DataTable, Pill, SectionTitle } from "@/components/app-primitives";

export const Route = createFileRoute("/app/admin/custom-fields")({
  head: () => ({ meta: [{ title: "Custom Fields — DigiCB" }] }),
  component: Page,
});

const OBJECTS = [
  "Client",
  "Application",
  "Project",
  "Audit",
  "NCR",
  "Certificate",
  "Personnel",
  "Document",
  "Complaint",
  "Training Course",
];

const FIELDS = [
  { name: "Industry Sector", object: "Client", type: "Select", tags: "crm, sector" },
  { name: "Risk Category", object: "Application", type: "Select", tags: "risk, review" },
  { name: "Audit Complexity", object: "Audit", type: "Number", tags: "duration" },
  { name: "Client Tier", object: "Client", type: "Select", tags: "crm, tier" },
  { name: "Halal Category", object: "Application", type: "Multi-select", tags: "halal, ps4992" },
  { name: "Preferred Language", object: "Application", type: "Select", tags: "audit" },
];

function Page() {
  return (
    <div>
      <AppPageHeader
        title="Custom Fields, Objects & Tags"
        description="Configure custom fields per object, custom objects and tagging for flexible classification across all modules."
      />
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <SectionTitle>Custom objects</SectionTitle>
          <div className="mt-3 flex flex-wrap gap-2">
            {OBJECTS.map((o) => (
              <Pill key={o} tone="info">
                {o}
              </Pill>
            ))}
            <Pill tone="muted">+ Add object</Pill>
          </div>
        </Card>
        <Card>
          <SectionTitle>Tag library</SectionTitle>
          <div className="mt-3 flex flex-wrap gap-2">
            {[
              "high-risk",
              "strategic",
              "halal",
              "multi-site",
              "integrated",
              "transfer",
              "remote",
              "witnessed",
              "priority",
              "expedited",
            ].map((t) => (
              <Pill key={t} tone="muted">
                #{t}
              </Pill>
            ))}
          </div>
        </Card>
      </div>
      <Card className="mt-6">
        <SectionTitle>Custom fields</SectionTitle>
        <div className="mt-4">
          <DataTable
            headers={["Field", "Object", "Type", "Tags"]}
            rows={FIELDS.map((f) => [
              <span className="font-medium text-foreground">{f.name}</span>,
              <Pill tone="info">{f.object}</Pill>,
              <span className="text-muted-foreground">{f.type}</span>,
              <span className="text-muted-foreground">{f.tags}</span>,
            ])}
          />
        </div>
      </Card>
    </div>
  );
}
