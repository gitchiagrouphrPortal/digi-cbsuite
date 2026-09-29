import { createFileRoute } from "@tanstack/react-router";
import { RecordListView } from "@/components/record-list";
import { ncrs } from "@/lib/records-collections-ext";
export const Route = createFileRoute("/app/ncr/")({
  head: () => ({ meta: [{ title: "All NCRs — DigiCB" }] }),
  component: () => (
    <RecordListView
      def={ncrs}
      moduleKey="ncr"
      routeBase="/app/ncr"
      description="Nonconformity reports and corrective actions."
    />
  ),
});
