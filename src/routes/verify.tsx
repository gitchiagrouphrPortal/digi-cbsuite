import { createFileRoute, Link } from "@tanstack/react-router";
import { ShieldCheck, Search, Award, BadgeCheck } from "lucide-react";
import { useState } from "react";

export const Route = createFileRoute("/verify")({
  head: () => ({
    meta: [
      { title: "Verify a Certificate — DigiCB" },
      {
        name: "description",
        content:
          "Public certificate verification for DigiCB-issued certifications. No confidential information is exposed.",
      },
      { property: "og:title", content: "Verify a Certificate — DigiCB" },
      {
        property: "og:description",
        content: "Public certificate verification for DigiCB-issued certifications.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: VerifyPage,
});

function VerifyPage() {
  const [cert, setCert] = useState("");
  const [result, setResult] = useState<null | { ok: boolean; data?: Record<string, string> }>(null);
  const [loading, setLoading] = useState(false);

  const check = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);
    setTimeout(() => {
      setLoading(false);
      if (cert.trim().toUpperCase() === "CERT-1009") {
        setResult({
          ok: true,
          data: {
            number: "CERT-1009",
            holder: "Gulf Foods LLC",
            scheme: "ISO 9001:2015",
            framework: "ISO/IEC 17021-1",
            scope: "Manufacture of packaged food products",
            issued: "2023-10-15",
            expiry: "2026-10-14",
            status: "Valid",
            accreditation: "Global ACI",
          },
        });
      } else {
        setResult({ ok: false });
      }
    }, 500);
  };

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="border-b border-border bg-card/80 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-4xl items-center gap-2.5 px-4">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <div className="flex flex-col leading-none">
            <span className="font-display text-lg font-bold text-foreground">DigiCB</span>
            <span className="text-[10px] uppercase tracking-widest text-muted-foreground">
              Public Verification
            </span>
          </div>
          <Link to="/login" className="ml-auto text-sm font-medium text-primary hover:underline">
            Sign in
          </Link>
        </div>
      </header>

      <main className="flex flex-1 items-center justify-center px-4 py-12">
        <div className="w-full max-w-xl">
          <div className="text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <BadgeCheck className="h-7 w-7" />
            </div>
            <h1 className="mt-5 font-display text-2xl font-bold tracking-tight text-foreground">
              Verify a certificate
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Enter a DigiCB certificate number to confirm its validity. Only approved public
              information is shown.
            </p>
          </div>

          <form onSubmit={check} className="mt-8 flex gap-2">
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                value={cert}
                onChange={(e) => setCert(e.target.value)}
                placeholder="e.g. CERT-1009"
                className="w-full rounded-md border border-input bg-background py-2.5 pl-9 pr-3 text-sm outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="inline-flex h-11 items-center rounded-md bg-primary px-5 text-sm font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-60"
            >
              {loading ? "Checking…" : "Verify"}
            </button>
          </form>
          <p className="mt-2 text-center text-xs text-muted-foreground">
            Try the demo number:{" "}
            <button
              onClick={() => setCert("CERT-1009")}
              className="font-mono font-semibold text-primary hover:underline"
            >
              CERT-1009
            </button>
          </p>

          {result && (
            <div className="mt-8">
              {result.ok ? (
                <div className="rounded-xl border border-success/30 bg-success/5 p-6">
                  <div className="flex items-center gap-2">
                    <Award className="h-5 w-5 text-success" />
                    <h2 className="font-display text-lg font-semibold text-success">
                      Certificate valid
                    </h2>
                  </div>
                  <dl className="mt-4 grid grid-cols-2 gap-x-6 gap-y-3 text-sm">
                    {result.data &&
                      Object.entries(result.data).map(([k, v]) => (
                        <div key={k} className="flex flex-col">
                          <dt className="text-xs uppercase tracking-wide text-muted-foreground">
                            {k}
                          </dt>
                          <dd className="font-medium capitalize text-foreground">{v}</dd>
                        </div>
                      ))}
                  </dl>
                </div>
              ) : (
                <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-6 text-center">
                  <h2 className="font-display text-lg font-semibold text-destructive">
                    No certificate found
                  </h2>
                  <p className="mt-1 text-sm text-muted-foreground">
                    No valid certificate matches that number. Check the number and try again.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
