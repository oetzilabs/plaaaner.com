import { resolve } from "node:path";
import { defineConfig } from "@solidjs/start/config";

export default defineConfig({
  server: {
    preset: "aws-lambda",
    esbuild: {
      options: {
        target: "esnext",
        treeShaking: true,
      },
    },
  },
  middleware: "./src/middleware.ts",
  vite: {
    ssr: { noExternal: ["@kobalte/core", "@internationalized/message"] },
    resolve: {
      alias: {
        "@": resolve(process.cwd(), "src"),
      },
    },
    optimizeDeps: {
      esbuildOptions: {
        target: "esnext",
        treeShaking: true,
      },
    },
    build: {
      target: "esnext",
    },
  },
});
