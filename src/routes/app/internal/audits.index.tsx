import { createFileRoute } from "@tanstack/react-router";
import { RecordListView } from "@/components/record-list";
import { internalAudits } from "@/lib/records-collections-ext";

export const Route = createFileRoute("/app/internal/audits/")({
  head: () => ({ meta: [{ title: "Internal Audit Programme — DigiCB" }] }),
  component: () => (
    <RecordListView
      def={internalAudits}
      moduleKey="internal"
      routeBase="/app/internal/audits"
      description="Internal audit programme and reports."
    />
  ),
});
