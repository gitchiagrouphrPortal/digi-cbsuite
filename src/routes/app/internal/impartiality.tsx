import { createFileRoute } from "@tanstack/react-router";
import { RecordListView } from "@/components/record-list";
import { risks } from "@/lib/records-collections-ext";

export const Route = createFileRoute("/app/internal/impartiality")({
  head: () => ({ meta: [{ title: "Impartiality Risks — DigiCB" }] }),
  component: () => (
    <RecordListView
      def={risks}
      moduleKey="internal"
      routeBase="/app/risks"
      description="Impartiality risk register — threats to independence, conflicts of interest and safeguarding controls."
    />
  ),
});
