import { join } from "path";
import { DrizzlePostgreSQLAdapter } from "@lucia-auth/adapter-drizzle";
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { migrate as mig } from "drizzle-orm/neon-http/migrator";
import { Resource } from "sst";
import * as schema from "./schema";

const client = neon(Resource.DatabaseUrl.value);

export const db = drizzle(client, {
  schema,
});

export const migrate = async () => {
  const stage = Resource.App.stage;
  const folder = stage !== "production" ? "packages/core/src/drizzle/migrations" : "drizzle/migrations";
  return mig(db, { migrationsFolder: join(process.cwd(), folder) });
};

export const luciaAdapter = new DrizzlePostgreSQLAdapter(db, schema.sessions, schema.users);
