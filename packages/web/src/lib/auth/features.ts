import { cache } from "@solidjs/router";
import { Config } from "sst/node/config";
import { z } from "zod";

export const getWithEmail = cache(async () => {
  "use server";
  const withEmail = Config.WITH_EMAIL;

  return z.coerce.boolean().parse(withEmail);
}, "with-email");

export const getIsLoginEnabled = cache(async () => {
  "use server";
  const withLogin = Config.LOGIN_ENABLED;


  return withLogin === "true";
}, "with-login");

