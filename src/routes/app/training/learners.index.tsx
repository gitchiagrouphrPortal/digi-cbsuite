import { createFileRoute } from "@tanstack/react-router";
import { RecordListView } from "@/components/record-list";
import { learners } from "@/lib/records-collections-ext";

export const Route = createFileRoute("/app/training/learners/")({
  head: () => ({ meta: [{ title: "Learners — DigiCB" }] }),
  component: () => (
    <RecordListView
      def={learners}
      moduleKey="training"
      routeBase="/app/training/learners"
      description="Learner records with enrolments, CPD hours and certification status."
    />
  ),
});
