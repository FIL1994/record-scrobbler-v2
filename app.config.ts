import { defineConfig } from "@tanstack/react-start/config";
import tsConfigPaths from "vite-tsconfig-paths";
import localesPlugin from "@react-aria/optimize-locales-plugin";

export default defineConfig({
  tsr: {
    appDirectory: "src",
    autoCodeSplitting: true,
  },
  server: {
    preset: "netlify",
    prerender: {
      routes: ["/", "/scrobble", "/search-album"],
      crawlLinks: true,
    },
  },
  vite: {
    plugins: [
      { ...localesPlugin.vite({ locales: [] }), enforce: "pre" },
      tsConfigPaths({
        projects: ["./tsconfig.json"],
      }) as any,
    ],
  },
});
