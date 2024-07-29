import { api } from "./Api";
import { auth } from "./Auth";
import { cloudflare, domain, subdomain } from "./Domain";
import { SECRET_DATABASE_URL, SECRET_EMAIL_FROM, SECRET_LOGIN_ENABLED, SECRET_WITH_EMAIL } from "./Secrets";
import { bucket } from "./Storage";
import { ws } from "./Websocket";

const main_app_url = $dev ? "http://localhost:3000" : `https://${subdomain}${domain}`;

export const solidStartApp = new sst.aws.SolidStart(`SolidStartApp`, {
  link: [bucket, api, SECRET_DATABASE_URL, SECRET_WITH_EMAIL, auth, SECRET_EMAIL_FROM, SECRET_LOGIN_ENABLED, ws],
  path: "packages/web",
  buildCommand: "pnpm build",
  environment: {
    VITE_API_URL: api.url,
    VITE_APP_URL: main_app_url,
    VITE_AUTH_URL: auth.authenticator.url,
    VITE_WS_LINK: ws.url,
  },
  domain: {
    name: `${subdomain}${domain}`,
    dns: cloudflare,
  },
  invalidation: {
    paths: "all",
    wait: true,
  },
});
