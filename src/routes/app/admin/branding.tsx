import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { getOrgFn, updateOrgFn } from "@/lib/digicb.functions";
import type { Organization } from "@/lib/digicb-types";
import { AppPageHeader, Card, SectionTitle } from "@/components/app-primitives";
import { toast } from "sonner";
import { useTheme } from "@/hooks/use-theme";

export const Route = createFileRoute("/app/admin/branding")({
  head: () => ({ meta: [{ title: "Theme & Branding — DigiCB" }] }),
  component: Page,
});

function Page() {
  const getOrg = useServerFn(getOrgFn);
  const updateOrg = useServerFn(updateOrgFn);
  const { theme, toggle } = useTheme();
  const [org, setOrg] = useState<Organization | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    getOrg()
      .then(setOrg)
      .catch(() => {});
  }, [getOrg]);

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!org) return;
    setSaving(true);
    try {
      await updateOrg({ data: org });
      toast.success("Branding saved");
    } catch {
      toast.error("Could not save");
    }
    setSaving(false);
  };

  return (
    <div>
      <AppPageHeader
        title="Theme & Branding"
        description="Organization logo text, theme colours, light/dark mode and primary colour."
      />
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <SectionTitle>Appearance</SectionTitle>
          <div className="mt-4 space-y-4">
            <div>
              <span className="mb-1 block text-xs font-semibold text-foreground">Theme mode</span>
              <div className="flex gap-2">
                <button
                  onClick={() => theme === "dark" && toggle()}
                  className={`rounded-md border px-4 py-2 text-sm font-medium ${
                    theme === "light"
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-input bg-background text-foreground hover:bg-accent"
                  }`}
                >
                  Light
                </button>
                <button
                  onClick={() => theme === "light" && toggle()}
                  className={`rounded-md border px-4 py-2 text-sm font-medium ${
                    theme === "dark"
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-input bg-background text-foreground hover:bg-accent"
                  }`}
                >
                  Dark
                </button>
              </div>
            </div>
            <div className="rounded-lg border border-border p-3">
              <p className="text-xs font-semibold uppercase text-muted-foreground">
                Primary colour
              </p>
              <div className="mt-2 flex gap-2">
                {["#1e3a5f", "#0f766e", "#7c3aed", "#b45309"].map((c) => (
                  <span
                    key={c}
                    className="h-8 w-8 rounded-full border border-border"
                    style={{ background: c }}
                  />
                ))}
              </div>
              <p className="mt-2 text-xs text-muted-foreground">
                Deep navy is the DigiCB default primary.
              </p>
            </div>
          </div>
        </Card>
        <Card>
          <SectionTitle>Brand identity</SectionTitle>
          {org ? (
            <form onSubmit={save} className="mt-4 space-y-3">
              <label className="block">
                <span className="mb-1 block text-xs font-semibold text-foreground">
                  Organization name
                </span>
                <input
                  value={org.name ?? ""}
                  onChange={(e) => setOrg({ ...org, name: e.target.value })}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
                />
              </label>
              <label className="block">
                <span className="mb-1 block text-xs font-semibold text-foreground">Logo text</span>
                <input
                  value={org.logoText ?? ""}
                  onChange={(e) => setOrg({ ...org, logoText: e.target.value })}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
                />
              </label>
              <label className="block">
                <span className="mb-1 block text-xs font-semibold text-foreground">
                  Primary colour (hex)
                </span>
                <input
                  value={org.primaryColor ?? ""}
                  onChange={(e) => setOrg({ ...org, primaryColor: e.target.value })}
                  placeholder="#1e3a5f"
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
                />
              </label>
              <button
                disabled={saving}
                className="inline-flex h-10 items-center rounded-md bg-primary px-4 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
              >
                {saving ? "Saving…" : "Save branding"}
              </button>
            </form>
          ) : (
            <p className="text-sm text-muted-foreground">Loading…</p>
          )}
        </Card>
      </div>
    </div>
  );
}
