import { SolidStartSite, StackContext, use } from "sst/constructs";
import { Api } from "./Api";
import { Auth } from "./Auth";
import { Domain } from "./Domain";
import { Secrets } from "./Secrets";
import { Storage } from "./Storage";
import { Websocket } from "./Websocket";

export function SolidStart({ stack, app }: StackContext) {
  const dns = use(Domain);
  const api = use(Api);
  const auth = use(Auth);
  const bucket = use(Storage);
  const secrets = use(Secrets);
  const ws = use(Websocket);

  const main_app_url = app.local ? "http://localhost:3000" : dns.domain;

  const solidStartApp = new SolidStartSite(stack, `${app.name}-app`, {
    bind: [bucket, api, secrets.DATABASE_URL, ws, secrets.WITH_EMAIL, auth, secrets.EMAIL_FROM, secrets.LOGIN_ENABLED],
    path: "packages/web",
    buildCommand: "pnpm build",
    runtime: "nodejs20.x",
    environment: {
      VITE_API_URL: api.customDomainUrl || api.url,
      VITE_APP_URL: main_app_url,
      VITE_AUTH_URL: auth.url,
      VITE_WS_LINK: ws.customDomainUrl || ws.url,
    },
    customDomain: {
      domainName: dns.domain,
      hostedZone: dns.zone.zoneName,
    },
    invalidation: {
      paths: "all",
      wait: true,
    },
  });

  stack.addOutputs({
    SiteUrl: solidStartApp.customDomainUrl || "http://localhost:3000",
  });

  return {
    publicSolidStartApp: solidStartApp,
  };
}
