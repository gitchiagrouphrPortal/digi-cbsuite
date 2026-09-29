import { createFileRoute } from "@tanstack/react-router";
import { RecordListView } from "@/components/record-list";
import { ncrs } from "@/lib/records-collections-ext";
export const Route = createFileRoute("/app/ncr/major")({
  head: () => ({ meta: [{ title: "Major NCRs — DigiCB" }] }),
  component: () => (
    <RecordListView
      def={ncrs}
      moduleKey="ncr"
      routeBase="/app/ncr"
      description="Major nonconformities."
    />
  ),
});
