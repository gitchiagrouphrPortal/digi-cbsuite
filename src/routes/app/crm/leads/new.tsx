import { createFileRoute } from "@tanstack/react-router";
import { RecordFormView } from "@/components/record-form";
import { leads } from "@/lib/records-collections";

export const Route = createFileRoute("/app/crm/leads/new")({
  head: () => ({ meta: [{ title: "New Lead — DigiCB" }] }),
  component: () => <RecordFormView def={leads} moduleKey="crm" routeBase="/app/crm/leads" />,
});
