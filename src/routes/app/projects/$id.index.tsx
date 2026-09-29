import { createFileRoute } from "@tanstack/react-router";
import { RecordDetailView } from "@/components/record-detail";
import { projects } from "@/lib/records-collections";
export const Route = createFileRoute("/app/projects/$id/")({
  head: () => ({ meta: [{ title: "Project — DigiCB" }] }),
  component: () => {
    const { id } = Route.useParams();
    return (
      <RecordDetailView
        def={projects}
        moduleKey="projects"
        routeBase="/app/projects"
        recordId={id}
      />
    );
  },
});
