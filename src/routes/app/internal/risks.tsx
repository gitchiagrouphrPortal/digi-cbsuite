import { createFileRoute } from "@tanstack/react-router";
import { RecordListView } from "@/components/record-list";
import { risks } from "@/lib/records-collections-ext";

export const Route = createFileRoute("/app/internal/risks")({
  head: () => ({ meta: [{ title: "Risks & Opportunities — DigiCB" }] }),
  component: () => (
    <RecordListView
      def={risks}
      moduleKey="internal"
      routeBase="/app/risks"
      description="Risk and opportunity register with assessment, treatment and closure tracking."
    />
  ),
});
