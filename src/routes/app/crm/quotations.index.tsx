import { createFileRoute } from "@tanstack/react-router";
import { RecordListView } from "@/components/record-list";
import { quotations } from "@/lib/records-collections";
export const Route = createFileRoute("/app/crm/quotations/")({
  head: () => ({ meta: [{ title: "Quotations — DigiCB" }] }),
  component: () => (
    <RecordListView
      def={quotations}
      moduleKey="crm"
      routeBase="/app/crm/quotations"
      description="Certification quotations and pricing."
    />
  ),
});
