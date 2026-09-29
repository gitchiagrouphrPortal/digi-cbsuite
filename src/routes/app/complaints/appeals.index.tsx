import { createFileRoute } from "@tanstack/react-router";
import { RecordListView } from "@/components/record-list";
import { appeals } from "@/lib/records-collections-ext";

export const Route = createFileRoute("/app/complaints/appeals/")({
  head: () => ({ meta: [{ title: "Appeal Register — DigiCB" }] }),
  component: () => (
    <RecordListView
      def={appeals}
      moduleKey="complaints"
      routeBase="/app/complaints/appeals"
      description="Appeals register with independent review and decision workflow."
    />
  ),
});
