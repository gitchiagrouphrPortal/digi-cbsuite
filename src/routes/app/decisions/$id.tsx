import { createFileRoute, Outlet } from "@tanstack/react-router";
export const Route = createFileRoute("/app/decisions/$id")({
  component: () => <Outlet />,
});
