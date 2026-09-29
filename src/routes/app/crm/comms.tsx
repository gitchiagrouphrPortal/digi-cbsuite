import { createFileRoute, Outlet } from "@tanstack/react-router";
export const Route = createFileRoute("/app/crm/comms")({
  component: () => <Outlet />,
});
