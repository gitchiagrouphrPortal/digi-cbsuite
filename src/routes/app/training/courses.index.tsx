import { createFileRoute } from "@tanstack/react-router";
import { RecordListView } from "@/components/record-list";
import { courses } from "@/lib/records-collections-ext";

export const Route = createFileRoute("/app/training/courses/")({
  head: () => ({ meta: [{ title: "Course Catalogue — DigiCB" }] }),
  component: () => (
    <RecordListView
      def={courses}
      moduleKey="training"
      routeBase="/app/training/courses"
      description="Course catalogue: lead-auditor, internal-auditor, awareness, diplomas, professional certifications, Lean Six Sigma, online, classroom, onsite and blended learning."
    />
  ),
});
