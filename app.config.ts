// app.config.ts
import { defineConfig } from "@tanstack/react-start/config";
import tsConfigPaths from "vite-tsconfig-paths";
import { cloudflare } from "unenv";

export default defineConfig({
  tsr: {
    appDirectory: "src",
  },
  server: {
    preset: "cloudflare-pages",
    unenv: cloudflare,
    prerender: {
      routes: ["/"],
      crawlLinks: true,
    },
  },
  vite: {
    plugins: [
      tsConfigPaths({
        projects: ["./tsconfig.json"],
      }),
    ],
  },
});
