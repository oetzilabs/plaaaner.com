import { DrizzlePostgreSQLAdapter } from "@lucia-auth/adapter-drizzle";
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { migrate as mig } from "drizzle-orm/neon-http/migrator";
import { join } from "path";
import { Config } from "sst/node/config";
import * as schema from "./schema";

const client = neon(Config.DATABASE_URL);

export const db = drizzle(client, {
  schema,
});

export const migrate = async () => {
  const stage = Config.STAGE;
  const folder = stage !== "production" ? "packages/core/src/drizzle/migrations" : "drizzle/migrations";
  return mig(db, { migrationsFolder: join(process.cwd(), folder) });
};

export const luciaAdapter = new DrizzlePostgreSQLAdapter(db, schema.sessions, schema.users);
