import { cache, redirect } from "@solidjs/router";
import { getEvent } from "vinxi/http";
import { getContext } from "../auth/context";

export const getMessagingSettings = cache(async () => {
  "use server";

  const [ctx, event] = await getContext();
  if (!ctx) throw redirect("/auth/login");
  if (!ctx.user) throw redirect("/auth/login");

  return {
    type: "anyone",
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  // const n = await Notifications.findManyByUserId(user.id);
  // return n;
}, "messaging-settings");
