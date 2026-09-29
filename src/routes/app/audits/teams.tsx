import { createFileRoute } from "@tanstack/react-router";
import { RecordListView } from "@/components/record-list";
import { audits } from "@/lib/records-collections-ext";
export const Route = createFileRoute("/app/audits/teams")({
  head: () => ({ meta: [{ title: "Audit Teams — DigiCB" }] }),
  component: () => (
    <RecordListView
      def={audits}
      moduleKey="audits"
      routeBase="/app/audits/programmes"
      description="Audits with assigned team leaders and members."
    />
  ),
});
