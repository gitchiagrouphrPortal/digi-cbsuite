// @leadconnector/vite-tanstack-config already includes the following — do NOT add them manually
// or the app will break with duplicate plugins:
//   - tanstackStart, viteReact, tailwindcss, tsConfigPaths, nitro (build-only using cloudflare as a default target),
//     componentTagger (dev-only, jsxSource fallback + tailwind config), @tanstack/devtools-vite source injection (data-tsd-source, dev-only),
//     HMR gate/flush, dev-server bridge controls, server diagnostics, lightningcss, and sandbox detection
//     (secure host allowlist, port/strictPort, watch ignores, and HMR overlay policy).
// You can pass additional config via defineConfig({ vite: { ... }, etc... }) if needed.
import { defineConfig } from "@leadconnector/vite-tanstack-config";

// The bundled config unconditionally applies the `vite-tsconfig-paths` plugin
// (a required peer dependency), which triggers a Vite 8 deprecation warning
// ("plugin detected… use resolve.tsconfigPaths instead"). We cannot disable
// it through options, so we post-process the resolved config: drop that plugin
// and switch to Vite's native tsconfig path resolution, which covers the
// `@/*` → `./src/*` mapping declared in tsconfig.json.
const bundled = defineConfig({
  // Browser errors stay in the trusted parent-frame console-log flow;
  // do not expose the bridge collector on the public sandbox tunnel.
  devServerBridge: { errorCollector: false },
  // Do not set server.hmr.timeout — Vite 8 deprecated those websocket fields
  // (use server.ws.*). Overlay/host/port are package-owned; default WS timeout is 30s.
  tanstackStart: {
    // Redirect TanStack Start's bundled server entry to src/server.ts (our SSR error wrapper).
    // nitro/vite builds from this
    server: {
    allowedHosts: true, entry: "server" },
  },
});

function stripTsconfigPathsPlugin(plugins: unknown): unknown {
  if (!Array.isArray(plugins)) return plugins;
  const kept: unknown[] = [];
  for (const p of plugins) {
    if (!p) continue;
    if (Array.isArray(p)) {
      const nested = stripTsconfigPathsPlugin(p);
      if (Array.isArray(nested)) kept.push(...nested);
      else kept.push(nested);
      continue;
    }
    // Vite plugins carry a `name`; drop the bundled tsconfig-paths plugin.
    if (typeof p === "object" && "name" in p && (p as { name: string }).name === "vite-tsconfig-paths") {
      continue;
    }
    kept.push(p);
  }
  return kept;
}

export default async (env: Parameters<typeof bundled>[0]) => {
  const config = (await bundled(env)) as {
    plugins?: unknown;
    resolve?: Record<string, unknown>;
    [k: string]: unknown;
  };
  config.plugins = stripTsconfigPathsPlugin(config.plugins);
  config.resolve = {
    ...(config.resolve ?? {}),
    // Vite 8 native tsconfig path resolution replaces the dropped plugin.
    tsconfigPaths: true,
  };
  return config;
};
