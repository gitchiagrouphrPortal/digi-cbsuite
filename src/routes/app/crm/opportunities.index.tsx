import { createFileRoute } from "@tanstack/react-router";
import { RecordListView } from "@/components/record-list";
import { opportunities } from "@/lib/records-collections";
export const Route = createFileRoute("/app/crm/opportunities/")({
  head: () => ({ meta: [{ title: "Opportunities — DigiCB" }] }),
  component: () => (
    <RecordListView
      def={opportunities}
      moduleKey="crm"
      routeBase="/app/crm/opportunities"
      description="Sales opportunities linked to client organizations."
    />
  ),
});
