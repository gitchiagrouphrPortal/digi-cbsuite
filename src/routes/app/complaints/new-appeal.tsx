import { createFileRoute } from "@tanstack/react-router";
import { RecordFormView } from "@/components/record-form";
import { appeals } from "@/lib/records-collections-ext";

export const Route = createFileRoute("/app/complaints/new-appeal")({
  head: () => ({ meta: [{ title: "New Appeal — DigiCB" }] }),
  component: () => (
    <RecordFormView def={appeals} moduleKey="complaints" routeBase="/app/complaints/appeals" />
  ),
});
