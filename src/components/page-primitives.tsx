import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Download } from "lucide-react";

export function PageShell({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={cn("mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:py-14", className)}>{children}</div>
  );
}

export function PageHeader({
  eyebrow,
  title,
  description,
  children,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  children?: ReactNode;
}) {
  return (
    <div className="mb-10 flex flex-col gap-4 border-b border-border pb-8 sm:flex-row sm:items-end sm:justify-between">
      <div className="max-w-3xl">
        {eyebrow && (
          <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-primary">
            {eyebrow}
          </p>
        )}
        <h1 className="font-display text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
          {title}
        </h1>
        {description && <p className="mt-3 text-base text-muted-foreground">{description}</p>}
      </div>
      {children && <div className="flex shrink-0 items-center gap-2">{children}</div>}
    </div>
  );
}

export function ExportBar({ label = "Export" }: { label?: string }) {
  const formats = ["Word", "Excel", "PDF"];
  return (
    <div className="flex items-center gap-1.5">
      {formats.map((f) => (
        <button
          key={f}
          className="inline-flex h-8 items-center gap-1.5 rounded-md border border-input bg-background px-3 text-xs font-medium text-foreground shadow-sm transition-colors hover:bg-accent"
        >
          <Download className="h-3.5 w-3.5" />
          {label} {f}
        </button>
      ))}
    </div>
  );
}

export function SectionCard({
  title,
  description,
  children,
  className,
}: {
  title?: string;
  description?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={cn("rounded-xl border border-border bg-card p-6 shadow-sm", className)}>
      {title && <h2 className="font-display text-xl font-semibold text-foreground">{title}</h2>}
      {description && <p className="mt-1.5 text-sm text-muted-foreground">{description}</p>}
      {children && <div className={cn(title && "mt-5")}>{children}</div>}
    </section>
  );
}
