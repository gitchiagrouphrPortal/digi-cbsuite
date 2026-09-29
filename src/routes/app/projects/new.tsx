import { createFileRoute } from "@tanstack/react-router";
import { RecordFormView } from "@/components/record-form";
import { projects } from "@/lib/records-collections";
export const Route = createFileRoute("/app/projects/new")({
  head: () => ({ meta: [{ title: "New Project — DigiCB" }] }),
  component: () => <RecordFormView def={projects} moduleKey="projects" routeBase="/app/projects" />,
});
