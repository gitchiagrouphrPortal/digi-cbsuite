import { createFileRoute } from "@tanstack/react-router";
import { RecordListView } from "@/components/record-list";
import { decisions } from "@/lib/records-collections-ext";
export const Route = createFileRoute("/app/decisions/committee")({
  head: () => ({ meta: [{ title: "Certification Committee — DigiCB" }] }),
  component: () => (
    <RecordListView
      def={decisions}
      moduleKey="decisions"
      routeBase="/app/decisions"
      description="All certification committee decisions."
    />
  ),
});
