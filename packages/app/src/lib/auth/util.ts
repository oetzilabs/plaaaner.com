import { cache, redirect } from "@solidjs/router";
import { getRequestEvent } from "solid-js/web";
import { lucia } from ".";
import { getCookie } from "vinxi/http";

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

export const getAuthenticatedSession = cache(async () => {
  "use server";
  const event = getRequestEvent()!;
  const { id } = event.nativeEvent.context.session;
  if (!id) {
    console.log("no session id");
    return redirect("/auth/login");
  }
  const { session } = await lucia.validateSession(id);
  console.log({ session });
  return session;
}, "session");
