import { Link, useLocation } from "@tanstack/react-router";
import { ShieldCheck, Menu, X } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { DELIVERABLES } from "@/lib/digicb-data";

export function SiteHeader() {
  const location = useLocation();
  const [open, setOpen] = useState(false);

  // Hide marketing chrome inside the authenticated app and on the login page.
  if (
    location.pathname.startsWith("/app") ||
    location.pathname === "/login" ||
    location.pathname.startsWith("/verify")
  ) {
    return null;
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-card/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
        <Link to="/" className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-sm">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <div className="flex flex-col leading-none">
            <span className="font-display text-lg font-bold tracking-tight text-foreground">
              DigiCB
            </span>
            <span className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground">
              Certification Body OS
            </span>
          </div>
        </Link>

        <nav className="hidden items-center gap-1 lg:flex">
          {DELIVERABLES.map((d) => {
            const active = location.pathname === d.route;
            return (
              <Link
                key={d.id}
                to={d.route}
                className={cn(
                  "rounded-md px-3 py-2 text-sm font-medium transition-colors",
                  active
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
                )}
              >
                {d.label}
              </Link>
            );
          })}
        </nav>

        <button
          className="flex h-9 w-9 items-center justify-center rounded-md text-foreground hover:bg-accent lg:hidden"
          onClick={() => setOpen((v) => !v)}
          aria-label="Toggle menu"
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {open && (
        <nav className="border-t border-border bg-card px-4 py-3 lg:hidden">
          <div className="grid grid-cols-2 gap-1">
            {DELIVERABLES.map((d) => {
              const active = location.pathname === d.route;
              return (
                <Link
                  key={d.id}
                  to={d.route}
                  onClick={() => setOpen(false)}
                  className={cn(
                    "rounded-md px-3 py-2 text-sm font-medium",
                    active ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-accent",
                  )}
                >
                  {d.label}
                </Link>
              );
            })}
          </div>
        </nav>
      )}
    </header>
  );
}

export function SiteFooter() {
  const location = useLocation();
  if (
    location.pathname.startsWith("/app") ||
    location.pathname === "/login" ||
    location.pathname.startsWith("/verify")
  ) {
    return null;
  }
  return (
    <footer className="border-t border-border bg-card">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
        <div className="flex flex-col items-start justify-between gap-6 sm:flex-row">
          <div className="max-w-sm">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <ShieldCheck className="h-4 w-4" />
              </div>
              <span className="font-display text-base font-bold text-foreground">DigiCB</span>
            </div>
            <p className="mt-3 text-sm text-muted-foreground">
              An original, secure operating system for accredited conformity assessment bodies —
              certification, Halal, personnel, product, training and inspections.
            </p>
          </div>
          <div className="text-sm text-muted-foreground">
            <p className="font-medium text-foreground">Planning Portal</p>
            <p className="mt-1">Requirements · Architecture · Roadmap</p>
            <p className="mt-2 text-xs">
              IAF archived 1 Jan 2026 · Global ACI documents maintained alongside legacy IAF.
            </p>
          </div>
        </div>
        <div className="mt-8 border-t border-border pt-6 text-xs text-muted-foreground">
          © {new Date().getFullYear()} DigiCB. Original interface, data model and workflow design.
          Not derived from any proprietary product.
        </div>
      </div>
    </footer>
  );
}
