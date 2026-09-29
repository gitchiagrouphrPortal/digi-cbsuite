import { createFileRoute } from "@tanstack/react-router";
import { RecordFormView } from "@/components/record-form";
import { kpis } from "@/lib/records-collections-ext";

export const Route = createFileRoute("/app/kpis/$id/edit")({
  head: () => ({ meta: [{ title: "Edit KPI Record — DigiCB" }] }),
  component: () => {
    const { id } = Route.useParams();
    return <RecordFormView def={kpis} moduleKey="kpis" routeBase="/app/kpis" recordId={id} />;
  },
});
