import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { getCalendarFn } from "@/lib/digicb.functions";
import { AppPageHeader, Card, DataTable, Pill } from "@/components/app-primitives";

export const Route = createFileRoute("/app/calendar")({
  head: () => ({ meta: [{ title: "Compliance Calendar — DigiCB" }] }),
  component: CalendarPage,
});

function CalendarPage() {
  const getCalendar = useServerFn(getCalendarFn);
  const [events, setEvents] = useState<Awaited<ReturnType<typeof getCalendar>> | null>(null);

  useEffect(() => {
    let active = true;
    getCalendar()
      .then((e) => active && setEvents(e))
      .catch(() => {});
    return () => {
      active = false;
    };
  }, [getCalendar]);

  return (
    <div>
      <AppPageHeader
        title="Compliance Calendar"
        description="Recurring compliance activities with reminders and escalation."
      />
      <Card>
        {!events ? (
          <p className="text-sm text-muted-foreground">Loading…</p>
        ) : (
          <DataTable
            headers={["Activity", "Category", "Date", "Recurrence", "Status"]}
            rows={events.map((e) => [
              <span className="font-medium text-foreground">{e.title}</span>,
              <span className="text-muted-foreground">{e.category}</span>,
              <span className="text-muted-foreground">{e.date}</span>,
              <span className="text-muted-foreground">{e.recurrence}</span>,
              <Pill tone="info">{e.status}</Pill>,
            ])}
          />
        )}
      </Card>
    </div>
  );
}
