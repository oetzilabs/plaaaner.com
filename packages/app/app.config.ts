import path from "node:path";
import { defineConfig } from "@solidjs/start/config";
// import devtools from "solid-devtools/vite";

export default defineConfig({
  server: {
    preset: "node-server",
    esbuild: {
      options: {
        target: "esnext",
        treeShaking: true,
      },
    },
  },
  middleware: "./src/middleware.ts",
  vite(options) {
    return {
      ssr: { noExternal: ["@kobalte/core", "@internationalized/message"] },
      resolve: {
        alias: {
          "@": path.resolve(process.cwd(), "src"),
        },
      },
      optimizeDeps: {
        esbuildOptions: {
          target: "esnext",
        },
      },
      build: {
        target: "esnext",
      },
      // plugins: [devtools()],
    };
  },
});
