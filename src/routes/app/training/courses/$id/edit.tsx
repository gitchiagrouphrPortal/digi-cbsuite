import { createFileRoute } from "@tanstack/react-router";
import { RecordFormView } from "@/components/record-form";
import { courses } from "@/lib/records-collections-ext";

export const Route = createFileRoute("/app/training/courses/$id/edit")({
  head: () => ({ meta: [{ title: "Edit Course — DigiCB" }] }),
  component: () => {
    const { id } = Route.useParams();
    return (
      <RecordFormView
        def={courses}
        moduleKey="training"
        routeBase="/app/training/courses"
        recordId={id}
      />
    );
  },
});
