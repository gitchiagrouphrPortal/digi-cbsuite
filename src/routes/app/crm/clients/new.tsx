import { createFileRoute } from "@tanstack/react-router";
import { RecordFormView } from "@/components/record-form";
import { clients } from "@/lib/records-collections";

export const Route = createFileRoute("/app/crm/clients/new")({
  head: () => ({ meta: [{ title: "New Organization — DigiCB" }] }),
  component: () => <RecordFormView def={clients} moduleKey="crm" routeBase="/app/crm/clients" />,
});
