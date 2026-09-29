import { createFileRoute } from "@tanstack/react-router";
import { RecordFormView } from "@/components/record-form";
import { quotations } from "@/lib/records-collections";
export const Route = createFileRoute("/app/crm/quotations/new")({
  head: () => ({ meta: [{ title: "New Quotation — DigiCB" }] }),
  component: () => (
    <RecordFormView def={quotations} moduleKey="crm" routeBase="/app/crm/quotations" />
  ),
});
