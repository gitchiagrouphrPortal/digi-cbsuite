import { createFileRoute } from "@tanstack/react-router";
import { RecordDetailView } from "@/components/record-detail";
import { learners } from "@/lib/records-collections-ext";

export const Route = createFileRoute("/app/training/learners/$id/")({
  head: () => ({ meta: [{ title: "Learner Details — DigiCB" }] }),
  component: () => {
    const { id } = Route.useParams();
    return (
      <RecordDetailView
        def={learners}
        moduleKey="training"
        routeBase="/app/training/learners"
        recordId={id}
      />
    );
  },
});
