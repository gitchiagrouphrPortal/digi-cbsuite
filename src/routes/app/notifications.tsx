import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { getNotificationsFn, markNotificationsReadFn } from "@/lib/digicb.functions";
import { AppPageHeader, Card, EmptyState, Pill } from "@/components/app-primitives";

export const Route = createFileRoute("/app/notifications")({
  head: () => ({ meta: [{ title: "Notifications — DigiCB" }] }),
  component: NotificationsPage,
});

function NotificationsPage() {
  const getNotifications = useServerFn(getNotificationsFn);
  const markRead = useServerFn(markNotificationsReadFn);
  const [items, setItems] = useState<Awaited<ReturnType<typeof getNotifications>> | null>(null);

  useEffect(() => {
    let active = true;
    getNotifications()
      .then((n) => active && setItems(n))
      .catch(() => {});
    return () => {
      active = false;
    };
  }, [getNotifications]);

  const markAll = async () => {
    try {
      const updated = await markRead({ data: {} });
      setItems(updated);
    } catch {
      /* ignore */
    }
  };

  return (
    <div>
      <AppPageHeader
        title="Notifications"
        description="System alerts, deadlines and workflow notifications."
      >
        <button
          onClick={markAll}
          className="inline-flex h-9 items-center rounded-md border border-input bg-card px-3 text-sm font-medium text-foreground hover:bg-accent"
        >
          Mark all read
        </button>
      </AppPageHeader>
      <Card>
        {!items ? (
          <p className="text-sm text-muted-foreground">Loading…</p>
        ) : items.length === 0 ? (
          <EmptyState title="No notifications" body="You're all caught up." />
        ) : (
          <div className="space-y-2">
            {items.map((n) => (
              <div
                key={n.id}
                className={`flex items-start gap-3 rounded-lg border px-4 py-3 ${n.read ? "border-border bg-card" : "border-primary/20 bg-primary/5"}`}
              >
                <Pill tone="info">{n.category}</Pill>
                <div className="flex-1">
                  <p className="text-sm font-medium text-foreground">{n.title}</p>
                  <p className="text-sm text-muted-foreground">{n.body}</p>
                </div>
                {!n.read && <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-primary" />}
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
