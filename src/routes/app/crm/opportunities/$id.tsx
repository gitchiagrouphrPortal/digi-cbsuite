import { createFileRoute, Outlet } from "@tanstack/react-router";
export const Route = createFileRoute("/app/crm/opportunities/$id")({
  component: () => <Outlet />,
});
