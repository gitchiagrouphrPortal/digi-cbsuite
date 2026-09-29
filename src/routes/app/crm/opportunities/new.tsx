import { createFileRoute } from "@tanstack/react-router";
import { RecordFormView } from "@/components/record-form";
import { opportunities } from "@/lib/records-collections";
export const Route = createFileRoute("/app/crm/opportunities/new")({
  head: () => ({ meta: [{ title: "New Opportunity — DigiCB" }] }),
  component: () => (
    <RecordFormView def={opportunities} moduleKey="crm" routeBase="/app/crm/opportunities" />
  ),
});
