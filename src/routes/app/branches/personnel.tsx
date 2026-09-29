import { createFileRoute } from "@tanstack/react-router";
import { RecordListView } from "@/components/record-list";
import { personnel } from "@/lib/records-collections-ext";

export const Route = createFileRoute("/app/branches/personnel")({
  head: () => ({ meta: [{ title: "Branch Personnel — DigiCB" }] }),
  component: () => (
    <RecordListView
      def={personnel}
      moduleKey="personnel"
      routeBase="/app/personnel"
      description="Personnel assigned to each branch with competence and authorization status."
    />
  ),
});
