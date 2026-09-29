import { createFileRoute, Link } from "@tanstack/react-router";
import { AppPageHeader, Card, SectionTitle } from "@/components/app-primitives";

// Catch-all for authenticated workspace routes that do not have a dedicated
// page file. Renders a clean "module not available" message — never a sprint
// or future-development placeholder.
export const Route = createFileRoute("/app/$")({
  head: () => ({ meta: [{ name: "robots", content: "noindex" }] }),
  component: NotFoundSplat,
});

function NotFoundSplat() {
  const { _splat } = Route.useParams();
  const seg = (_splat ?? "").split("/")[0] || "module";
  const title = pretty(seg);
  return (
    <div>
      <AppPageHeader title={title} description="This module area could not be located." />
      <Card className="border-dashed">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
            <span className="text-lg">ⓘ</span>
          </div>
          <div>
            <SectionTitle className="text-base">{title}</SectionTitle>
            <p className="mt-1.5 max-w-2xl text-sm text-muted-foreground">
              The requested workspace area does not have a dedicated page. Use the sidebar to
              navigate to an available module, or check that the address is correct.
            </p>
            <p className="mt-3 text-xs font-medium text-primary">
              <Link to="/app/dashboard" className="hover:underline">
                Return to dashboard →
              </Link>
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}

function pretty(s: string): string {
  return s.replace(/-/g, " ").replace(/^\w/, (c) => c.toUpperCase());
}
