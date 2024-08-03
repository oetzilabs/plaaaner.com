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
  // const folder = Resource.App.stage !== "production" ? "drizzle/migrations" : "drizzle/migrations";
  // console.log("Migrating... ", folder, process.cwd());
  return mig(db, { migrationsFolder: join(process.cwd(), "drizzle/migrations") });
};

export const luciaAdapter = new DrizzlePostgreSQLAdapter(db, schema.sessions, schema.users);
