import { SolidStartSite, StackContext, use } from "sst/constructs";
import { ApiStack } from "./ApiStack";
import { StorageStack } from "./StorageStack";
import { DNSStack } from "./DNSStack";
import { SecretsStack } from "./SecretsStack";
import { AuthStack } from "./AuthStack";

export function SolidStartStack({ stack, app }: StackContext) {
  const dns = use(DNSStack);
  const api = use(ApiStack);
  const auth = use(AuthStack);
  // const { db } = use(DatabaseStack);
  const bucket = use(StorageStack);
  const secrets = use(SecretsStack);

  const solidStartApp = new SolidStartSite(stack, `${app.name}-app`, {
    bind: [bucket, api, secrets.DATABASE_URL],
    path: "packages/app",
    buildCommand: "pnpm build",
    environment: {
      VITE_API_URL: api.customDomainUrl || api.url,
      VITE_AUTH_URL: auth.url,
    },
    customDomain: {
      domainName: dns.domain,
      hostedZone: dns.zone.zoneName,
    },
  });

  stack.addOutputs({
    SiteUrl: solidStartApp.customDomainUrl || "http://localhost:3000",
  });

  return {
    publicSolidStartApp: solidStartApp,
  };
}
