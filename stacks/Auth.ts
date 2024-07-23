import { StackContext, use } from "sst/constructs";
import { Auth as AUTH } from "sst/constructs/future";
import { Domain } from "./Domain";
import { Secrets } from "./Secrets";

export function Auth({ stack, app }: StackContext) {
  const { GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, DATABASE_URL, EMAIL_FROM } = use(Secrets);
  const dns = use(Domain);
  const auth = new AUTH(stack, "auth", {
    authenticator: {
      handler: "packages/functions/src/auth.handler",
      bind: [GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, DATABASE_URL, EMAIL_FROM],
      environment: {
        AUTH_FRONTEND_URL: app.mode === "dev" ? "http://localhost:3000" : "https://" + dns.domain,
        EMAIL_DOMAIN: dns.domain,
      },
      permissions: ["ses"],
      runtime: "nodejs20.x",
    },
    customDomain: {
      domainName: "auth." + dns.domain,
      hostedZone: dns.zone.zoneName,
    },
  });

  stack.addOutputs({
    AuthEndpoint: auth.url,
  });

  return auth;
}
