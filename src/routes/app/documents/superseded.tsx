import { createFileRoute } from "@tanstack/react-router";
import { RecordListView } from "@/components/record-list";
import { documents } from "@/lib/records-collections-ext";
export const Route = createFileRoute("/app/documents/superseded")({
  head: () => ({ meta: [{ title: "Superseded Documents — DigiCB" }] }),
  component: () => (
    <RecordListView
      def={documents}
      moduleKey="documents"
      routeBase="/app/documents"
      description="Superseded and archived document versions."
      fixedFilter={{ statusIn: ["superseded", "archived"] }}
    />
  ),
});
