import { Record } from "../.sst/platform/src/components/dns";

export const domain = "plaaaner.com";

export const subdomain = !$dev ? "" : `${$app.stage}.dev.`;

export const cloudflare = sst.cloudflare.dns({
  zone: "9fedcb4302b75990b8564afba355440b",
  override: true,
});
