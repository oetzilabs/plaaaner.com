import { cloudflare, domain, subdomain } from "./Domain";
import * as secrets from "./Secrets";

export const ws = new sst.aws.ApiGatewayWebSocket("Websocket", {
  domain: {
    name: `ws.${subdomain}${domain}`,
    dns: cloudflare,
  },
});

const link = [ws, ...Object.values(secrets)];

const copyFiles = [
  {
    from: "packages/core/src/drizzle",
    to: "drizzle",
  },
];

ws.route("$default", {
  handler: "packages/functions/src/ws.main",
  description: "This is the main function",
  link,
  copyFiles,
});

ws.route("$connect", {
  handler: "packages/functions/src/ws.connect",
  description: "This is the connect function",
  link,
  copyFiles,
});

ws.route("$disconnect", {
  handler: "packages/functions/src/ws.disconnect",
  description: "This is the disconnect function",
  link,
  copyFiles,
});

ws.route("sendnotification", {
  handler: "packages/functions/src/ws.sendnotification",
  description: "This is the sendnotification function",
  link,
  copyFiles,
});

ws.route("ping", {
  handler: "packages/functions/src/ws.ping",
  description: "This is the ping function",
  link,
  copyFiles,
});
