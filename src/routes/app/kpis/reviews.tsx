import { createFileRoute } from "@tanstack/react-router";
import { RecordListView } from "@/components/record-list";
import { kpis } from "@/lib/records-collections-ext";

export const Route = createFileRoute("/app/kpis/reviews")({
  head: () => ({ meta: [{ title: "KPI Reviews — DigiCB" }] }),
  component: () => (
    <RecordListView
      def={kpis}
      moduleKey="kpis"
      routeBase="/app/kpis"
      description="KPIs due for review with evidence, comments and corrective actions."
      fixedFilter={{ statusIn: ["review", "action"] }}
    />
  ),
});
