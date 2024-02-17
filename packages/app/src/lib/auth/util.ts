import { cache, redirect } from "@solidjs/router";
import { getRequestEvent } from "solid-js/web";
import { lucia } from ".";

export const getAuthenticatedUser = cache(async () => {
  "use server";
  const event = getRequestEvent()!;
  if (!event.nativeEvent.context.session) {
    throw redirect("/auth/login");
  }
  const { id } = event.nativeEvent.context.session;
  const { user } = await lucia.validateSession(id);
  return user;
}, "user");
