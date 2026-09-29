import { createFileRoute } from "@tanstack/react-router";
import { RecordFormView } from "@/components/record-form";
import { certificates } from "@/lib/records-collections-ext";
export const Route = createFileRoute("/app/certificates/new")({
  head: () => ({ meta: [{ title: "New Certificate — DigiCB" }] }),
  component: () => (
    <RecordFormView def={certificates} moduleKey="certificates" routeBase="/app/certificates" />
  ),
});
