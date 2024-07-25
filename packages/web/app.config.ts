import { defineConfig } from "@solidjs/start/config";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export default defineConfig({
  server: {
    preset: "aws-lambda",
    inlineDynamicImports: true,
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
        "@": resolve(__dirname, "./src"),
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