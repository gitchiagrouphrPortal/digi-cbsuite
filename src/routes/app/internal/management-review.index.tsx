import { createFileRoute } from "@tanstack/react-router";
import { RecordListView } from "@/components/record-list";
import { mgmtReviews } from "@/lib/records-collections-ext";

export const Route = createFileRoute("/app/internal/management-review/")({
  head: () => ({ meta: [{ title: "Management Review — DigiCB" }] }),
  component: () => (
    <RecordListView
      def={mgmtReviews}
      moduleKey="internal"
      routeBase="/app/internal/management-review"
      description="Management review records covering required inputs, decisions, actions, owners and follow-up status."
    />
  ),
});
