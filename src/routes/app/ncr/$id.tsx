import { createFileRoute, Outlet } from "@tanstack/react-router";
export const Route = createFileRoute("/app/ncr/$id")({
  component: () => <Outlet />,
});
