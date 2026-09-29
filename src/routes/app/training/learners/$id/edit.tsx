import { createFileRoute } from "@tanstack/react-router";
import { RecordFormView } from "@/components/record-form";
import { learners } from "@/lib/records-collections-ext";

export const Route = createFileRoute("/app/training/learners/$id/edit")({
  head: () => ({ meta: [{ title: "Edit Learner — DigiCB" }] }),
  component: () => {
    const { id } = Route.useParams();
    return (
      <RecordFormView
        def={learners}
        moduleKey="training"
        routeBase="/app/training/learners"
        recordId={id}
      />
    );
  },
});
