import { createFileRoute } from "@tanstack/react-router";
import { RecordListView } from "@/components/record-list";
import { personnel } from "@/lib/records-collections-ext";
export const Route = createFileRoute("/app/personnel/")({
  head: () => ({ meta: [{ title: "Personnel Register — DigiCB" }] }),
  component: () => (
    <RecordListView
      def={personnel}
      moduleKey="personnel"
      routeBase="/app/personnel"
      description="Competence files for auditors, experts, reviewers and decision-makers."
    />
  ),
});
