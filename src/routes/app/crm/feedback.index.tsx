import { createFileRoute } from "@tanstack/react-router";
import { RecordListView } from "@/components/record-list";
import { feedback } from "@/lib/records-collections";
export const Route = createFileRoute("/app/crm/feedback/")({
  head: () => ({ meta: [{ title: "Client Feedback — DigiCB" }] }),
  component: () => (
    <RecordListView
      def={feedback}
      moduleKey="crm"
      routeBase="/app/crm/feedback"
      description="Client satisfaction feedback and ratings."
    />
  ),
});
