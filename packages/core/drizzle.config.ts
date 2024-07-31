import type { Config as DrizzleConfig } from "drizzle-kit";
import { Resource } from "sst";

export default {
  out: "./src/drizzle/migrations",
  schema: "./src/drizzle/sql/schema.ts",
  verbose: true,
  dialect: "postgresql",
  strict: true,
  dbCredentials: {
    url: Resource.DatabaseUrl.value,
  },
} satisfies DrizzleConfig;
