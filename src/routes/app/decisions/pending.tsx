import { createFileRoute } from "@tanstack/react-router";
import { RecordListView } from "@/components/record-list";
import { decisions } from "@/lib/records-collections-ext";
export const Route = createFileRoute("/app/decisions/pending")({
  head: () => ({ meta: [{ title: "Pending Decisions — DigiCB" }] }),
  component: () => (
    <RecordListView
      def={decisions}
      moduleKey="decisions"
      routeBase="/app/decisions"
      description="Certification decisions awaiting approval."
      fixedFilter={{ statusIn: ["pending_decision", "reviewed"] }}
    />
  ),
});
