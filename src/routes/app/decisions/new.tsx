import { createFileRoute } from "@tanstack/react-router";
import { RecordFormView } from "@/components/record-form";
import { decisions } from "@/lib/records-collections-ext";
export const Route = createFileRoute("/app/decisions/new")({
  head: () => ({ meta: [{ title: "New Decision — DigiCB" }] }),
  component: () => (
    <RecordFormView def={decisions} moduleKey="decisions" routeBase="/app/decisions" />
  ),
});
