import { createFileRoute, redirect, Outlet } from "@tanstack/react-router";
import { AppShell } from "@/components/app-shell";
import { getSessionFn } from "@/lib/digicb.functions";
import { FrameworkProvider } from "@/lib/framework-context";

// Authenticated workspace layout. Redirects to /login if no session.
// All functional authenticated workspace routes mount under /app/*.
export const Route = createFileRoute("/app")({
  beforeLoad: async () => {
    const res = await getSessionFn();
    if (!res.user) throw redirect({ to: "/login" });
  },
  component: () => (
    <FrameworkProvider>
      <AppShell>
        <Outlet />
      </AppShell>
    </FrameworkProvider>
  ),
});
