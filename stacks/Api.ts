import { Api as API, StackContext, use } from "sst/constructs";
import { Storage } from "./Storage";
import { Domain } from "./Domain";
import { Secrets } from "./Secrets";
import { Auth } from "./Auth";

export function Api({ stack }: StackContext) {
  const dns = use(Domain);

  const bucket = use(Storage);
  const secrets = use(Secrets);
  const auth = use(Auth);

  const api = new API(stack, "api", {
    customDomain: {
      domainName: "api." + dns.domain,
      hostedZone: dns.zone.zoneName,
    },
    defaults: {
      function: {
        runtime: "nodejs20.x",
        bind: [secrets.DATABASE_URL, bucket, auth, secrets.GOOGLE_CLIENT_ID],
        copyFiles: [
          {
            from: "packages/core/src/drizzle",
            to: "drizzle",
          },
        ],
      },
    },
    routes: {
      "POST /migration": {
        function: {
          handler: "packages/functions/src/migrator.handler",
          description: "This is the migrator function",
        },
      },
      "GET /session": {
        function: {
          handler: "packages/functions/src/user.session",
          description: "This is the user.session function",
        },
      },
      "POST /corrupted": {
        function: {
          handler: "packages/functions/src/corrupted.main",
          description: "This is the corrupted entities function",
        },
      },
      "GET /healthcheck": {
        function: {
          handler: "packages/functions/src/healthcheck.main",
          description: "This is the healthcheck function",
        },
      },
      "POST /seed/tickets/types": {
        function: {
          handler: "packages/functions/src/tickets/types/seed.main",
          description: "This is the ticket_types seeding function",
        },
      },
      "POST /seed/tickets/types/upsert": {
        function: {
          handler: "packages/functions/src/tickets/types/seed.upsert",
          description: "This is the ticket_types upsert function",
        },
      },
      "GET /ticket_types/all": {
        function: {
          handler: "packages/functions/src/tickets/types/index.all",
          description: "This is the all ticket_types function",
        },
      },
      "GET /users/all": {
        function: {
          handler: "packages/functions/src/user.all",
          description: "This is the all users function",
        },
      },
    },
    cors: {
      allowOrigins: ["*", "http://localhost:3000", "http://localhost:3001"],
    },
  });

  // new Config.Parameter(stack, "API_URL", {
  //   value: api.url,
  // });

  stack.addOutputs({
    ApiEndpoint: api.customDomainUrl || api.url,
  });

  return api;
}
