import { createFileRoute } from "@tanstack/react-router";
import { RecordListView } from "@/components/record-list";
import { ncrs } from "@/lib/records-collections-ext";

export const Route = createFileRoute("/app/internal/corrective")({
  head: () => ({ meta: [{ title: "Corrective Actions — DigiCB" }] }),
  component: () => (
    <RecordListView
      def={ncrs}
      moduleKey="ncr"
      routeBase="/app/ncr"
      description="Internal corrective actions linked to NCRs, internal-audit findings and management-review actions."
      fixedFilter={{ statusIn: ["accepted", "effectiveness_review", "closed"] }}
    />
  ),
});
