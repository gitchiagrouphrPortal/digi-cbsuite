import { createFileRoute } from "@tanstack/react-router";
import { RecordListView } from "@/components/record-list";
import { kpis } from "@/lib/records-collections-ext";

export const Route = createFileRoute("/app/kpis/auditors")({
  head: () => ({ meta: [{ title: "Auditor KPIs — DigiCB" }] }),
  component: () => (
    <RecordListView
      def={kpis}
      moduleKey="kpis"
      routeBase="/app/kpis"
      description="Auditor utilization, audit delivery, findings quality and CPD KPIs."
      fixedFilter={{ status: "auditor" }}
    />
  ),
});
