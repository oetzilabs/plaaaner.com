import { cache } from "@solidjs/router";
import { Resource } from "sst";
import { z } from "zod";

export const getWithEmail = cache(async () => {
  "use server";
  const withEmail = Resource.WithEmail.value;

  return z.coerce.boolean().parse(withEmail);
}, "with-email");

export const getIsLoginEnabled = cache(async () => {
  "use server";
  const withLogin = Resource.LoginEnabled.value;

  return withLogin === "true";
}, "with-login");
