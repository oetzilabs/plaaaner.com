import { cache, redirect } from "@solidjs/router";
import { getEvent } from "vinxi/http";

export const getTaggedEntity = cache(async (tag: string) => {
  "use server";
  const event = getEvent()!;
  if (!event.context.user) {
    throw redirect("/auth/login");
  }
  const user = event.context.user;
  return {
    image: "",
    content: tag,
    tag: "JD",
  };
}, "taggedEntity");
