import { createFileRoute } from "@tanstack/react-router";
import { RecordListView } from "@/components/record-list";
import { kpis } from "@/lib/records-collections-ext";

export const Route = createFileRoute("/app/branches/kpis")({
  head: () => ({ meta: [{ title: "Branch KPIs — DigiCB" }] }),
  component: () => (
    <RecordListView
      def={kpis}
      moduleKey="kpis"
      routeBase="/app/kpis"
      description="Evidence-based branch KPIs: application-review quality, audit delivery, decision timeliness, complaint handling, NCR closure and record completeness."
      fixedFilter={{ status: "branch" }}
    />
  ),
});
