import { createFileRoute } from "@tanstack/react-router";
import { RecordListView } from "@/components/record-list";
import { internalAudits } from "@/lib/records-collections-ext";

export const Route = createFileRoute("/app/internal/reports")({
  head: () => ({ meta: [{ title: "Internal Audit Reports — DigiCB" }] }),
  component: () => (
    <RecordListView
      def={internalAudits}
      moduleKey="internal"
      routeBase="/app/internal/audits"
      description="Internal audit reports with findings, criteria and closure."
      fixedFilter={{ statusIn: ["completed", "closed"] }}
    />
  ),
});
