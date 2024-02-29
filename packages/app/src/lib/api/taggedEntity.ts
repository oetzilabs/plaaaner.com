import { cache, redirect } from "@solidjs/router";
import { getRequestEvent } from "solid-js/web";

export const getTaggedEntity = cache(async (tag: string) => {
  "use server";
  const event = getRequestEvent()!;
  if (!event.nativeEvent.context.user) {
    throw redirect("/auth/login");
  }
  const user = event.nativeEvent.context.user;
  return {
    image: "",
    content: tag,
    tag: "JD",
  };
}, "taggedEntity");
