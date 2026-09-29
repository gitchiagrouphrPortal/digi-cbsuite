import { createFileRoute } from "@tanstack/react-router";
import { RecordListView } from "@/components/record-list";
import { projects } from "@/lib/records-collections";
export const Route = createFileRoute("/app/projects/transition")({
  head: () => ({ meta: [{ title: "Transition Projects — DigiCB" }] }),
  component: () => (
    <RecordListView
      def={projects}
      moduleKey="projects"
      routeBase="/app/projects"
      description="Projects undergoing standard transition audits."
    />
  ),
});
