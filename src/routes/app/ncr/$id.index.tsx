import { createFileRoute } from "@tanstack/react-router";
import { RecordDetailView } from "@/components/record-detail";
import { ncrs } from "@/lib/records-collections-ext";
export const Route = createFileRoute("/app/ncr/$id/")({
  head: () => ({ meta: [{ title: "NCR — DigiCB" }] }),
  component: () => {
    const { id } = Route.useParams();
    return <RecordDetailView def={ncrs} moduleKey="ncr" routeBase="/app/ncr" recordId={id} />;
  },
});
