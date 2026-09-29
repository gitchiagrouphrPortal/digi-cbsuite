import { createFileRoute } from "@tanstack/react-router";
import { RecordFormView } from "@/components/record-form";
import { communications } from "@/lib/records-collections";
export const Route = createFileRoute("/app/crm/comms/new")({
  head: () => ({ meta: [{ title: "Log Communication — DigiCB" }] }),
  component: () => (
    <RecordFormView def={communications} moduleKey="crm" routeBase="/app/crm/comms" />
  ),
});
