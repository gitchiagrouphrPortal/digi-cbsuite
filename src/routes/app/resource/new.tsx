import { createFileRoute } from "@tanstack/react-router";
import { RecordFormView } from "@/components/record-form";
import { resourceGaps } from "@/lib/records-collections-ext";

export const Route = createFileRoute("/app/resource/new")({
  head: () => ({ meta: [{ title: "New Scheme Assessment — DigiCB" }] }),
  component: () => (
    <RecordFormView def={resourceGaps} moduleKey="resource" routeBase="/app/resource" />
  ),
});
