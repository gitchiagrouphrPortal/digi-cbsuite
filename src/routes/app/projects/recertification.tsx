import { createFileRoute } from "@tanstack/react-router";
import { RecordListView } from "@/components/record-list";
import { projects } from "@/lib/records-collections";
export const Route = createFileRoute("/app/projects/recertification")({
  head: () => ({ meta: [{ title: "Recertification Projects — DigiCB" }] }),
  component: () => (
    <RecordListView
      def={projects}
      moduleKey="projects"
      routeBase="/app/projects"
      description="Projects due for recertification."
      fixedFilter={{ statusIn: ["recertification"] }}
    />
  ),
});
