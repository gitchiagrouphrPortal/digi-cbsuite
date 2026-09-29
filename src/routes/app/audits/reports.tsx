import { createFileRoute } from "@tanstack/react-router";
import { RecordListView } from "@/components/record-list";
import { audits } from "@/lib/records-collections-ext";
export const Route = createFileRoute("/app/audits/reports")({
  head: () => ({ meta: [{ title: "Audit Reports — DigiCB" }] }),
  component: () => (
    <RecordListView
      def={audits}
      moduleKey="audits"
      routeBase="/app/audits/programmes"
      description="Completed audits with issued reports."
      fixedFilter={{ statusIn: ["completed", "report_issued"] }}
    />
  ),
});
