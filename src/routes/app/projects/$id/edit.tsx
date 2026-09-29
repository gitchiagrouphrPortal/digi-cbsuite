import { createFileRoute } from "@tanstack/react-router";
import { RecordFormView } from "@/components/record-form";
import { projects } from "@/lib/records-collections";
export const Route = createFileRoute("/app/projects/$id/edit")({
  head: () => ({ meta: [{ title: "Edit Project — DigiCB" }] }),
  component: () => {
    const { id } = Route.useParams();
    return (
      <RecordFormView def={projects} moduleKey="projects" routeBase="/app/projects" recordId={id} />
    );
  },
});
