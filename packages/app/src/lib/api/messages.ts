import { cache, redirect } from "@solidjs/router";
import { getRequestEvent } from "solid-js/web";

export const getMessagingSettings = cache(async () => {
  "use server";
  const event = getRequestEvent()!;
  if (!event.nativeEvent.context.user) {
    throw redirect("/auth/login");
  }
  const user = event.nativeEvent.context.user;
  return {
    type: "anyone",
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  // const n = await Notifications.findManyByUserId(user.id);
  // return n;
}, "messageSetting");
