import path from "node:path";
import { defineConfig } from "@solidjs/start/config";

const IS_PROD = process.env.NODE_ENV === "production";

export default defineConfig({
  server: {
    preset: IS_PROD ? "aws-lambda" : "node-server",
    output: IS_PROD
      ? {
          dir: "dist",
          publicDir: "dist/client",
        }
      : {},
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
  },
});
