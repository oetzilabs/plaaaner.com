import path from "node:path";
import { defineConfig } from "@solidjs/start/config";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  start: {
    server: {
      preset: "node-server",
    },
  },
  ssr: {
    noExternal: ["@kobalte/core", "@internationalized/message"],
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
    },
  },
});
