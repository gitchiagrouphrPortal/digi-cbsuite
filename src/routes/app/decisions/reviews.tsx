import { createFileRoute } from "@tanstack/react-router";
import { RecordListView } from "@/components/record-list";
import { decisions } from "@/lib/records-collections-ext";
export const Route = createFileRoute("/app/decisions/reviews")({
  head: () => ({ meta: [{ title: "Technical Reviews — DigiCB" }] }),
  component: () => (
    <RecordListView
      def={decisions}
      moduleKey="decisions"
      routeBase="/app/decisions"
      description="Pending and completed technical reviews."
      fixedFilter={{ statusIn: ["pending_review", "reviewed"] }}
    />
  ),
});
