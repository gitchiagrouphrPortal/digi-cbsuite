import { createFileRoute } from "@tanstack/react-router";
import { RecordFormView } from "@/components/record-form";
import { personnel } from "@/lib/records-collections-ext";
export const Route = createFileRoute("/app/personnel/new")({
  head: () => ({ meta: [{ title: "New Personnel — DigiCB" }] }),
  component: () => (
    <RecordFormView def={personnel} moduleKey="personnel" routeBase="/app/personnel" />
  ),
});
