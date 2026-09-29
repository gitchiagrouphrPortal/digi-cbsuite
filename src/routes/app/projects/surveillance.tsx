import { createFileRoute } from "@tanstack/react-router";
import { RecordListView } from "@/components/record-list";
import { projects } from "@/lib/records-collections";
export const Route = createFileRoute("/app/projects/surveillance")({
  head: () => ({ meta: [{ title: "Surveillance Projects — DigiCB" }] }),
  component: () => (
    <RecordListView
      def={projects}
      moduleKey="projects"
      routeBase="/app/projects"
      description="Projects in the surveillance stage."
      fixedFilter={{ statusIn: ["surveillance"] }}
    />
  ),
});
