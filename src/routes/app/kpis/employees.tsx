import { createFileRoute } from "@tanstack/react-router";
import { RecordListView } from "@/components/record-list";
import { kpis } from "@/lib/records-collections-ext";

export const Route = createFileRoute("/app/kpis/employees")({
  head: () => ({ meta: [{ title: "Employee KPIs — DigiCB" }] }),
  component: () => (
    <RecordListView
      def={kpis}
      moduleKey="kpis"
      routeBase="/app/kpis"
      description="Evidence-based employee KPIs with targets, weightings, scores and corrective actions."
      fixedFilter={{ status: "employee" }}
    />
  ),
});
