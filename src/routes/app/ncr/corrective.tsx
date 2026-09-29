import { createFileRoute } from "@tanstack/react-router";
import { RecordListView } from "@/components/record-list";
import { ncrs } from "@/lib/records-collections-ext";
export const Route = createFileRoute("/app/ncr/corrective")({
  head: () => ({ meta: [{ title: "Corrective Actions — DigiCB" }] }),
  component: () => (
    <RecordListView
      def={ncrs}
      moduleKey="ncr"
      routeBase="/app/ncr"
      description="NCRs with corrective actions in progress."
      fixedFilter={{
        statusIn: [
          "correction_submitted",
          "root_cause_submitted",
          "action_submitted",
          "evidence_uploaded",
          "under_verification",
        ],
      }}
    />
  ),
});
