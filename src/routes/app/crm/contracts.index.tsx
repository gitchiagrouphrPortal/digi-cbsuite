import { createFileRoute } from "@tanstack/react-router";
import { RecordListView } from "@/components/record-list";
import { contracts } from "@/lib/records-collections";
export const Route = createFileRoute("/app/crm/contracts/")({
  head: () => ({ meta: [{ title: "Contracts — DigiCB" }] }),
  component: () => (
    <RecordListView
      def={contracts}
      moduleKey="crm"
      routeBase="/app/crm/contracts"
      description="Certification agreements and contracts."
    />
  ),
});
