import { createEnv } from "@t3-oss/env-core";
import { z } from "zod";

export const env = createEnv({
  /**
   * Specify what prefix the client-side variables must have.
   * This is enforced both on type-level and at runtime.
   */
  clientPrefix: "VITE_",
  server: {},
  client: {
    VITE_API_URL: z.string().default("http://localhost:3000"),
    VITE_AUTH_URL: z.string().default("http://localhost:3000"),
  },
  /**
   * What object holds the environment variables at runtime.
   * Often `process.env` or `import.meta.env`
   */
  runtimeEnv: process.env,
  emptyStringAsUndefined: false,
});
