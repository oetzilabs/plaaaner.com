import { migrate } from "@/core/drizzle/sql";
import { ApiHandler } from "sst/node/api";

export const handler = ApiHandler(async (_evt) => {
  await migrate().catch((e) => {
    // full error
    console.error(JSON.stringify(e, null, 2));
    throw e;
  });

  return {
    body: "Migrated!",
  };
});
