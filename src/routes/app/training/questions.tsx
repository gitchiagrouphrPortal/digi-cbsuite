import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { listRecordsFn } from "@/lib/records.functions";
import type { RecordDTO } from "@/lib/records-schema";
import { AppPageHeader, Card, EmptyState, DataTable, Pill } from "@/components/app-primitives";
import { Loader2 } from "lucide-react";

export const Route = createFileRoute("/app/training/questions")({
  head: () => ({ meta: [{ title: "Question Bank — DigiCB" }] }),
  component: Page,
});

function Page() {
  const list = useServerFn(listRecordsFn);
  const [courses, setCourses] = useState<RecordDTO[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let a = true;
    (async () => {
      try {
        const r = await list({ data: { collection: "courses", archived: false } });
        if (a) setCourses(r.records);
      } catch {
        /* */
      } finally {
        if (a) setLoading(false);
      }
    })();
    return () => {
      a = false;
    };
  }, [list]);

  return (
    <div>
      <AppPageHeader
        title="Question Bank"
        description="Controlled question banks per course with examiner and invigilator controls. Questions are mapped to learning objectives and syllabus topics."
      />
      {loading ? (
        <Card className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" /> Loading…
        </Card>
      ) : courses.length === 0 ? (
        <EmptyState
          title="No courses"
          body="Question banks are organized by course. Create courses first."
        />
      ) : (
        <DataTable
          headers={["Course", "Category", "Standard", "Duration", "Status"]}
          rows={courses.map((r) => [
            <span className="font-medium text-foreground">{String(r.data.title ?? "")}</span>,
            <Pill tone="info">{String(r.data.category ?? "—")}</Pill>,
            <span className="text-muted-foreground">{String(r.data.standard ?? "—")}</span>,
            <span className="text-muted-foreground">{String(r.data.duration ?? "—")} hrs</span>,
            <Pill tone={r.status === "active" ? "success" : "muted"}>{r.status}</Pill>,
          ])}
        />
      )}
    </div>
  );
}
