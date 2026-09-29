import { createFileRoute } from "@tanstack/react-router";
import { AppPageHeader, Card, DataTable, Pill, SectionTitle } from "@/components/app-primitives";

export const Route = createFileRoute("/app/admin/workflows")({
  head: () => ({ meta: [{ title: "Workflow Configuration — DigiCB" }] }),
  component: Page,
});

const WORKFLOWS = [
  {
    name: "Management System Certification",
    framework: "ISO/IEC 17021-1",
    stages: 20,
    gating: "Entry/exit criteria + approvals",
  },
  {
    name: "Halal Certification",
    framework: "PS 4992",
    stages: 16,
    gating: "Entry/exit criteria + approvals",
  },
  {
    name: "Personnel Certification",
    framework: "ISO/IEC 17024",
    stages: 14,
    gating: "Entry/exit criteria + approvals",
  },
  {
    name: "Product Certification",
    framework: "ISO/IEC 17065",
    stages: 15,
    gating: "Entry/exit criteria + approvals",
  },
  {
    name: "NCR & Corrective Action",
    framework: "All",
    stages: 13,
    gating: "Status transitions + verification",
  },
  { name: "Document Control", framework: "All", stages: 9, gating: "Review → approval → publish" },
  { name: "Complaint Handling", framework: "All", stages: 8, gating: "Independence + decision" },
];

function Page() {
  return (
    <div>
      <AppPageHeader
        title="Workflow Configuration"
        description="Configurable Kanban templates per framework with entry/exit criteria, mandatory documents, approvals, SLAs and notifications."
      />
      <Card>
        <SectionTitle>Workflow templates</SectionTitle>
        <div className="mt-4">
          <DataTable
            headers={["Workflow", "Framework", "Stages", "Gating"]}
            rows={WORKFLOWS.map((w) => [
              <span className="font-medium text-foreground">{w.name}</span>,
              <Pill tone="info">{w.framework}</Pill>,
              <span className="font-mono text-foreground">{w.stages}</span>,
              <span className="text-muted-foreground">{w.gating}</span>,
            ])}
          />
        </div>
      </Card>
    </div>
  );
}
