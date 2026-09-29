import { createFileRoute } from "@tanstack/react-router";
import { RecordListView } from "@/components/record-list";
import { clients } from "@/lib/records-collections";

export const Route = createFileRoute("/app/crm/clients/")({
  head: () => ({ meta: [{ title: "Organizations — DigiCB" }] }),
  component: () => (
    <RecordListView
      def={clients}
      moduleKey="crm"
      routeBase="/app/crm/clients"
      description="Client organizations across all frameworks."
    />
  ),
});
