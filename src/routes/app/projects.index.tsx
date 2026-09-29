import { createFileRoute } from "@tanstack/react-router";
import { RecordListView } from "@/components/record-list";
import { projects } from "@/lib/records-collections";
export const Route = createFileRoute("/app/projects/")({
  head: () => ({ meta: [{ title: "All Projects — DigiCB" }] }),
  component: () => (
    <RecordListView
      def={projects}
      moduleKey="projects"
      routeBase="/app/projects"
      description="Certification projects across all frameworks."
    />
  ),
});
