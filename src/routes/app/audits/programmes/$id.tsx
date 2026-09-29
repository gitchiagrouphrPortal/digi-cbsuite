import { createFileRoute, Outlet } from "@tanstack/react-router";
export const Route = createFileRoute("/app/audits/programmes/$id")({
  component: () => <Outlet />,
});
