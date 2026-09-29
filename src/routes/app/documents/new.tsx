import { createFileRoute } from "@tanstack/react-router";
import { RecordFormView } from "@/components/record-form";
import { documents } from "@/lib/records-collections-ext";
export const Route = createFileRoute("/app/documents/new")({
  head: () => ({ meta: [{ title: "New Document — DigiCB" }] }),
  component: () => (
    <RecordFormView def={documents} moduleKey="documents" routeBase="/app/documents" />
  ),
});
