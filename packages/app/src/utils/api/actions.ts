import { action, redirect } from "@solidjs/router";
import { getRequestEvent } from "solid-js/web";
import { lucia } from "../../lib/auth";
import { appendHeader } from "vinxi/http";

export const logout = action(async () => {
  "use server";
  const event = getRequestEvent()!;
  console.log("hello from logout action");
  if (!event.nativeEvent.context.session) {
    return new Error("Unauthorized");
  }
  await lucia.invalidateSession(event.nativeEvent.context.session.id);
  appendHeader(event, "Set-Cookie", lucia.createBlankSessionCookie().serialize());
  throw redirect("/auth/login", 303);
});
