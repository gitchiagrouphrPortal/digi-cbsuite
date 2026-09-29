// DigiCB accreditation framework quick-switch context.
// Client-safe. Persists the active workspace preset to localStorage so the
// selected framework survives navigation and refresh.
import { createContext, useContext, useState, useEffect, type ReactNode } from "react";

export interface FrameworkPreset {
  value: string;
  label: string;
  short: string;
}

export const FRAMEWORK_PRESETS: FrameworkPreset[] = [
  { value: "all", label: "All Frameworks", short: "All" },
  { value: "17021", label: "ISO/IEC 17021-1", short: "17021" },
  { value: "ps4992", label: "PS 4992 (Halal)", short: "PS 4992" },
  { value: "17024", label: "ISO/IEC 17024", short: "17024" },
  { value: "17065", label: "ISO/IEC 17065", short: "17065" },
];

interface FrameworkCtx {
  framework: string;
  setFramework: (v: string) => void;
}

const Ctx = createContext<FrameworkCtx>({ framework: "all", setFramework: () => {} });

export function FrameworkProvider({ children }: { children: ReactNode }) {
  const [framework, setFrameworkState] = useState("all");
  useEffect(() => {
    try {
      const stored = localStorage.getItem("digicb-framework");
      if (stored) setFrameworkState(stored);
    } catch {
      /* ignore */
    }
  }, []);
  const setFramework = (v: string) => {
    setFrameworkState(v);
    try {
      localStorage.setItem("digicb-framework", v);
    } catch {
      /* ignore */
    }
  };
  return <Ctx.Provider value={{ framework, setFramework }}>{children}</Ctx.Provider>;
}

export function useFramework() {
  return useContext(Ctx);
}

// A record matches the active framework when either its top-level framework
// field or its data.framework equals the preset (so seed data is covered).
export function recordMatchesFramework(
  rec: {
    framework: string | null;
    data: Record<string, unknown>;
  },
  fw: string,
): boolean {
  if (fw === "all") return true;
  return rec.framework === fw || String(rec.data.framework ?? "") === fw;
}
