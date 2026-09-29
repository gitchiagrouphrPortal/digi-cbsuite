import { createFileRoute } from "@tanstack/react-router";
import { KanbanView } from "@/components/record-kanban";
import { projects } from "@/lib/records-collections";
export const Route = createFileRoute("/app/projects/kanban")({
  head: () => ({ meta: [{ title: "Certification Kanban — DigiCB" }] }),
  component: () => <KanbanView def={projects} moduleKey="projects" routeBase="/app/projects" />,
});
