import { StackContext, use } from "sst/constructs";
import { DNSStack } from "./DNSStack";
import { SecretsStack } from "./SecretsStack";
import { Auth } from "sst/constructs/future";

export function AuthStack({ stack, app }: StackContext) {
  const { GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, DATABASE_URL } = use(SecretsStack);
  const dns = use(DNSStack);
  const auth = new Auth(stack, "auth", {
    authenticator: {
      handler: "packages/functions/src/auth.handler",
      bind: [GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, DATABASE_URL],
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