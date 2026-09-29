import { createFileRoute } from "@tanstack/react-router";
import { RecordFormView } from "@/components/record-form";
import { ncrs } from "@/lib/records-collections-ext";
export const Route = createFileRoute("/app/ncr/new")({
  head: () => ({ meta: [{ title: "New NCR — DigiCB" }] }),
  component: () => <RecordFormView def={ncrs} moduleKey="ncr" routeBase="/app/ncr" />,
});
