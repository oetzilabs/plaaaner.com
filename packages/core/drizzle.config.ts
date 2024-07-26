import type { Config as DrizzleConfig } from "drizzle-kit";

export default {
  out: "./src/drizzle/migrations",
  schema: "./src/drizzle/sql/schema.ts",
  verbose: true,
  dialect: "postgresql",
  strict: true,
} satisfies DrizzleConfig;
