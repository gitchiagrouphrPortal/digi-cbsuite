import { createFileRoute } from "@tanstack/react-router";
import { RecordDetailView } from "@/components/record-detail";
import { kpis } from "@/lib/records-collections-ext";

export const Route = createFileRoute("/app/kpis/$id/")({
  head: () => ({ meta: [{ title: "KPI Record — DigiCB" }] }),
  component: () => {
    const { id } = Route.useParams();
    return <RecordDetailView def={kpis} moduleKey="kpis" routeBase="/app/kpis" recordId={id} />;
  },
});
