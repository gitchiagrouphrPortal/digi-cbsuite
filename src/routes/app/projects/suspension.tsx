import { createFileRoute } from "@tanstack/react-router";
import { RecordListView } from "@/components/record-list";
import { projects } from "@/lib/records-collections";
export const Route = createFileRoute("/app/projects/suspension")({
  head: () => ({ meta: [{ title: "Suspension & Withdrawal — DigiCB" }] }),
  component: () => (
    <RecordListView
      def={projects}
      moduleKey="projects"
      routeBase="/app/projects"
      description="Suspended or withdrawn certification projects."
      fixedFilter={{ statusIn: ["suspended", "withdrawn"] }}
    />
  ),
});
