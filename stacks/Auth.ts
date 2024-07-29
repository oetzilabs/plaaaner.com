import { domain, subdomain } from "./Domain";
import {
  SECRET_DATABASE_URL,
  SECRET_EMAIL_FROM,
  SECRET_GOOGLE_CLIENT_ID,
  SECRET_GOOGLE_CLIENT_SECRET,
} from "./Secrets";

const copyFiles = [
  {
    from: "packages/core/src/drizzle",
    to: "drizzle",
  },
];

export const auth = new sst.aws.Auth(`Auth`, {
  authenticator: {
    handler: "packages/functions/src/auth.handler",
    link: [SECRET_GOOGLE_CLIENT_ID, SECRET_GOOGLE_CLIENT_SECRET, SECRET_DATABASE_URL, SECRET_EMAIL_FROM],
    environment: {
      AUTH_FRONTEND_URL: $dev ? "http://localhost:3000" : "https://" + subdomain + domain,
      EMAIL_DOMAIN: domain,
    },
    runtime: "nodejs20.x",
    copyFiles,
    url: true,
  },
});
