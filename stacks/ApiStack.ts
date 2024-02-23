import { Api, StackContext, use } from "sst/constructs";
import { StorageStack } from "./StorageStack";
import { DNSStack } from "./DNSStack";
import { SecretsStack } from "./SecretsStack";
import { AuthStack } from "./AuthStack";

export function ApiStack({ stack }: StackContext) {
  const dns = use(DNSStack);

  const bucket = use(StorageStack);
  const secrets = use(SecretsStack);
  const auth = use(AuthStack);

  const api = new Api(stack, "api", {
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
