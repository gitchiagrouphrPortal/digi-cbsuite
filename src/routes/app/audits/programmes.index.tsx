import { createFileRoute } from "@tanstack/react-router";
import { RecordListView } from "@/components/record-list";
import { audits } from "@/lib/records-collections-ext";
export const Route = createFileRoute("/app/audits/programmes/")({
  head: () => ({ meta: [{ title: "Audit Programmes — DigiCB" }] }),
  component: () => (
    <RecordListView
      def={audits}
      moduleKey="audits"
      routeBase="/app/audits/programmes"
      description="Audit programmes and scheduled audits."
    />
  ),
});
