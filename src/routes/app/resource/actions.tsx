import { createFileRoute } from "@tanstack/react-router";
import { RecordListView } from "@/components/record-list";
import { resourceGaps } from "@/lib/records-collections-ext";

export const Route = createFileRoute("/app/resource/actions")({
  head: () => ({ meta: [{ title: "Action Plans — DigiCB" }] }),
  component: () => (
    <RecordListView
      def={resourceGaps}
      moduleKey="resource"
      routeBase="/app/resource"
      description="Action plans with responsible persons, budgets and target launch dates for closing resource gaps."
      fixedFilter={{ statusIn: ["action_plan", "ready"] }}
    />
  ),
});
