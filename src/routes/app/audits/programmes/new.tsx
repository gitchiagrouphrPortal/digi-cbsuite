import { createFileRoute } from "@tanstack/react-router";
import { RecordFormView } from "@/components/record-form";
import { audits } from "@/lib/records-collections-ext";
export const Route = createFileRoute("/app/audits/programmes/new")({
  head: () => ({ meta: [{ title: "New Audit — DigiCB" }] }),
  component: () => (
    <RecordFormView def={audits} moduleKey="audits" routeBase="/app/audits/programmes" />
  ),
});
