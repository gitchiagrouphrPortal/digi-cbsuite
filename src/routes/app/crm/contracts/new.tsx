import { createFileRoute } from "@tanstack/react-router";
import { RecordFormView } from "@/components/record-form";
import { contracts } from "@/lib/records-collections";
export const Route = createFileRoute("/app/crm/contracts/new")({
  head: () => ({ meta: [{ title: "New Contract — DigiCB" }] }),
  component: () => (
    <RecordFormView def={contracts} moduleKey="crm" routeBase="/app/crm/contracts" />
  ),
});
