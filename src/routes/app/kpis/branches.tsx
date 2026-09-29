import { createFileRoute } from "@tanstack/react-router";
import { RecordListView } from "@/components/record-list";
import { kpis } from "@/lib/records-collections-ext";

export const Route = createFileRoute("/app/kpis/branches")({
  head: () => ({ meta: [{ title: "Branch KPIs — DigiCB" }] }),
  component: () => (
    <RecordListView
      def={kpis}
      moduleKey="kpis"
      routeBase="/app/kpis"
      description="Branch KPIs per IAF MD 23 oversight: application-review quality, audit delivery, decision timeliness, complaint handling and record completeness."
      fixedFilter={{ status: "branch" }}
    />
  ),
});
