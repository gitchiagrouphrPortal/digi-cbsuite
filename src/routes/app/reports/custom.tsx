import { createFileRoute } from "@tanstack/react-router";
import { AppPageHeader, Card, SectionTitle } from "@/components/app-primitives";
import { Pill } from "@/components/app-primitives";

export const Route = createFileRoute("/app/reports/custom")({
  head: () => ({ meta: [{ title: "Custom Report Builder — DigiCB" }] }),
  component: Page,
});

function Page() {
  return (
    <div>
      <AppPageHeader
        title="Custom Report Builder"
        description="Build custom reports with filters, saved views, scheduled delivery and role-based access."
      />
      <Card>
        <div className="flex items-start gap-3">
          <Pill tone="info">Builder</Pill>
          <div>
            <SectionTitle>Report configuration</SectionTitle>
            <p className="mt-1 text-sm text-muted-foreground">
              Select a data source, choose columns, apply filters, group by field, and save the
              view. Saved reports can be scheduled for PDF/spreadsheet delivery to authorized
              recipients.
            </p>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <div className="rounded-lg border border-border p-3">
                <p className="text-xs font-semibold uppercase text-muted-foreground">Data Source</p>
                <p className="mt-1 text-sm text-foreground">
                  Projects, Applications, Audits, NCRs, Personnel, Certificates, Documents,
                  Complaints, KPIs
                </p>
              </div>
              <div className="rounded-lg border border-border p-3">
                <p className="text-xs font-semibold uppercase text-muted-foreground">
                  Export Formats
                </p>
                <p className="mt-1 text-sm text-foreground">PDF, CSV (Excel), Dashboard view</p>
              </div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
