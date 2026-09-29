import { createFileRoute } from "@tanstack/react-router";
import { RecordListView } from "@/components/record-list";
import { leads } from "@/lib/records-collections";

export const Route = createFileRoute("/app/crm/leads/")({
  head: () => ({ meta: [{ title: "Leads & Inquiries — DigiCB" }] }),
  component: () => (
    <RecordListView
      def={leads}
      moduleKey="crm"
      routeBase="/app/crm/leads"
      description="Inbound leads and certification inquiries."
    />
  ),
});
