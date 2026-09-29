import { createFileRoute } from "@tanstack/react-router";
import { KanbanView } from "@/components/record-kanban";
import { ncrs } from "@/lib/records-collections-ext";
export const Route = createFileRoute("/app/ncr/kanban")({
  head: () => ({ meta: [{ title: "NCR Kanban — DigiCB" }] }),
  component: () => <KanbanView def={ncrs} moduleKey="ncr" routeBase="/app/ncr" />,
});
