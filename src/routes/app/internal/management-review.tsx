import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/app/internal/management-review")({
  component: () => <Outlet />,
});
