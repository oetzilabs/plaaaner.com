import path from "node:path";
import { defineConfig } from "@solidjs/start/config";

export default defineConfig({
  server: {
    experimental: {
      // @ts-ignore
      islands: true,
    },
    preset: "aws-lambda",
    esbuild: {
      options: {
        target: "esnext",
        treeShaking: true,
      },
    },
  },
  vite: {
    ssr: { noExternal: ["@kobalte/core", "lucide-solid"] },
    resolve: {
      alias: {
        "@": path.resolve(process.cwd(), "src"),
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
