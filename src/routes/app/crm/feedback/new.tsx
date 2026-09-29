import { createFileRoute } from "@tanstack/react-router";
import { RecordFormView } from "@/components/record-form";
import { feedback } from "@/lib/records-collections";
export const Route = createFileRoute("/app/crm/feedback/new")({
  head: () => ({ meta: [{ title: "New Feedback — DigiCB" }] }),
  component: () => <RecordFormView def={feedback} moduleKey="crm" routeBase="/app/crm/feedback" />,
});
