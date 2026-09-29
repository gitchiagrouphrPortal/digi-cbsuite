import { createFileRoute } from "@tanstack/react-router";
import { RecordListView } from "@/components/record-list";
import { personnel } from "@/lib/records-collections-ext";

export const Route = createFileRoute("/app/resource/competence")({
  head: () => ({ meta: [{ title: "Competence Gaps — DigiCB" }] }),
  component: () => (
    <RecordListView
      def={personnel}
      moduleKey="personnel"
      routeBase="/app/personnel"
      description="Competence gaps for auditors, experts, reviewers and decision-makers required for new schemes."
    />
  ),
});
