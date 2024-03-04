import { SolidStartSite, StackContext, use } from "sst/constructs";
import { Api } from "./Api";
import { Storage } from "./Storage";
import { Domain } from "./Domain";
import { Secrets } from "./Secrets";
import { Auth } from "./Auth";
import { Websocket } from "./Websocket";

export function SolidStart({ stack, app }: StackContext) {
  const dns = use(Domain);
  const api = use(Api);
  const auth = use(Auth);
  const bucket = use(Storage);
  const secrets = use(Secrets);
  const ws = use(Websocket);

  const solidStartApp = new SolidStartSite(stack, `${app.name}-app`, {
    bind: [bucket, api, secrets.DATABASE_URL],
    path: "packages/app",
    buildCommand: "pnpm build",
    environment: {
      VITE_API_URL: api.customDomainUrl || api.url,
      VITE_AUTH_URL: auth.url,
      VITE_WS_LINK: ws.customDomainUrl || ws.url,
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
