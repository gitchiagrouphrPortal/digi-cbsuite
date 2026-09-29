import { createFileRoute } from "@tanstack/react-router";
import { RecordListView } from "@/components/record-list";
import { audits } from "@/lib/records-collections-ext";
export const Route = createFileRoute("/app/audits/scheduling")({
  head: () => ({ meta: [{ title: "Audit Scheduling — DigiCB" }] }),
  component: () => (
    <RecordListView
      def={audits}
      moduleKey="audits"
      routeBase="/app/audits/programmes"
      description="Plan and schedule audits."
      fixedFilter={{ statusIn: ["planned", "scheduled"] }}
    />
  ),
});
