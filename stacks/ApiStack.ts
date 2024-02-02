import { Api, Config, StackContext, use } from "sst/constructs";
import { StorageStack } from "./StorageStack";
import { DNSStack } from "./DNSStack";
import { SecretsStack } from "./SecretsStack";

export function ApiStack({ stack }: StackContext) {
  const dns = use(DNSStack);

  const { bucket } = use(StorageStack);
  const secrets = use(SecretsStack);

  const api = new Api(stack, "api", {
    customDomain: {
      domainName: "api." + dns.domain,
      hostedZone: dns.zone.zoneName,
    },
    defaults: {
      function: {
        nodejs: {
          install: ["@libsql/linux-x64-gnu", "@libsql/client"],
          // esbuild: { external: ["@libsql/linux-x64-gnu"] },
        },
        // handler: "packages/functions/src/migrator.handler",
        bind: [secrets.DATABASE_URL, secrets.DATABASE_AUTH_TOKEN, bucket],
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

  new Config.Parameter(stack, "API_URL", {
    value: api.url,
  });

  stack.addOutputs({
    ApiEndpoint: api.customDomainUrl || api.url,
  });

  return api;
}
