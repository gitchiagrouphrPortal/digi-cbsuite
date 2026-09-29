import { createFileRoute } from "@tanstack/react-router";
import { RecordListView } from "@/components/record-list";
import { audits } from "@/lib/records-collections-ext";
export const Route = createFileRoute("/app/audits/witness")({
  head: () => ({ meta: [{ title: "Witness Audits — DigiCB" }] }),
  component: () => (
    <RecordListView
      def={audits}
      moduleKey="audits"
      routeBase="/app/audits/programmes"
      description="Witnessed audits for auditor performance monitoring."
    />
  ),
});
