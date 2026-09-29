import { createFileRoute } from "@tanstack/react-router";
import { RecordListView } from "@/components/record-list";
import { decisions } from "@/lib/records-collections-ext";
export const Route = createFileRoute("/app/decisions/approved")({
  head: () => ({ meta: [{ title: "Approved Decisions — DigiCB" }] }),
  component: () => (
    <RecordListView
      def={decisions}
      moduleKey="decisions"
      routeBase="/app/decisions"
      description="Approved certification decisions."
      fixedFilter={{ statusIn: ["approved", "conditions"] }}
    />
  ),
});
