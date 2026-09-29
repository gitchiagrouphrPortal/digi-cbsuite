import { createFileRoute } from "@tanstack/react-router";
import { RecordFormView } from "@/components/record-form";
import { ncrs } from "@/lib/records-collections-ext";
export const Route = createFileRoute("/app/ncr/$id/edit")({
  head: () => ({ meta: [{ title: "Edit NCR — DigiCB" }] }),
  component: () => {
    const { id } = Route.useParams();
    return <RecordFormView def={ncrs} moduleKey="ncr" routeBase="/app/ncr" recordId={id} />;
  },
});
