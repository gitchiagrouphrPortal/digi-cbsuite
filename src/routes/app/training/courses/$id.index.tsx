import { createFileRoute } from "@tanstack/react-router";
import { RecordDetailView } from "@/components/record-detail";
import { courses } from "@/lib/records-collections-ext";

export const Route = createFileRoute("/app/training/courses/$id/")({
  head: () => ({ meta: [{ title: "Course Details — DigiCB" }] }),
  component: () => {
    const { id } = Route.useParams();
    return (
      <RecordDetailView
        def={courses}
        moduleKey="training"
        routeBase="/app/training/courses"
        recordId={id}
      />
    );
  },
});
