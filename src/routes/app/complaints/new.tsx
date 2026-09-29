import { createFileRoute } from "@tanstack/react-router";
import { RecordFormView } from "@/components/record-form";
import { complaints } from "@/lib/records-collections-ext";

export const Route = createFileRoute("/app/complaints/new")({
  head: () => ({ meta: [{ title: "New Complaint — DigiCB" }] }),
  component: () => (
    <RecordFormView def={complaints} moduleKey="complaints" routeBase="/app/complaints" />
  ),
});
