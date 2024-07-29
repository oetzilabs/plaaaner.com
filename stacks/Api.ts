import { auth } from "./Auth";
import { cloudflare, domain, subdomain } from "./Domain";
import * as secrets from "./Secrets";
import { ws } from "./Websocket";

export const api = new sst.aws.ApiGatewayV2(`Api`, {
  domain: {
    name: `api.${subdomain}${domain}`,
    dns: cloudflare,
  },
  cors: {
    allowOrigins: ["*", "http://localhost:3000"],
  },
});

const link = [ws, auth, ...Object.values(secrets)];

const copyFiles = [
  {
    from: "packages/core/src/drizzle",
    to: "drizzle",
  },
];

api.route("POST /migration", {
  handler: "packages/functions/src/migrator.handler",
  description: "This is the migrator function",
  copyFiles,
  link,
});

api.route("GET /session", {
  handler: "packages/functions/src/user.session",
  description: "This is the user.session function",
  copyFiles,
  link,
});

api.route("GET /healthcheck", {
  handler: "packages/functions/src/healthcheck.main",
  description: "This is the healthcheck function",
  copyFiles,
  link,
});

api.route("POST /seed/tickets/types", {
  handler: "packages/functions/src/tickets/types/seed.main",
  description: "This is the ticket_types seeding function",
  copyFiles,
  link,
});

api.route("POST /seed/tickets/types/upsert", {
  handler: "packages/functions/src/tickets/types/seed.upsert",
  description: "This is the ticket_types upsert function",
  copyFiles,
  link,
});

api.route("GET /ticket_types/all", {
  handler: "packages/functions/src/tickets/types/index.all",
  description: "This is the all ticket_types function",
  copyFiles,
  link,
});

api.route("POST /seed/plan_types", {
  handler: "packages/functions/src/plan_types/seed.main",
  description: "This is the plan_types seeding function",
  copyFiles,
  link,
});

api.route("POST /seed/plan_types/upsert", {
  handler: "packages/functions/src/plan_types/seed.upsert",
  description: "This is the plan_types upsert function",
  copyFiles,
  link,
});

api.route("GET /plan_types/all", {
  handler: "packages/functions/src/plan_types/index.all",
  description: "This is the all plan_types function",
  copyFiles,
  link,
});

api.route("GET /users/all", {
  handler: "packages/functions/src/user.all",
  description: "This is the all users function",
  copyFiles,
  link,
});

api.route("POST /websockets/revoke/all", {
  handler: "packages/functions/src/ws.revokeWebsocketConnections",
  description: "This is the revokeWebsocketConnections function",
  copyFiles,
  link,
});
