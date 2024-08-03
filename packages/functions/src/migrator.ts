import { migrate } from "@/core/drizzle/sql";
import { APIGatewayEvent, Handler } from "aws-lambda";

export const handler: Handler<APIGatewayEvent> = async (_evt) => {
  await migrate().catch((e) => {
    // full error
    console.error(JSON.stringify(e, null, 2));
    throw e;
  });

  return {
    body: "Migrated!",
  };
};
