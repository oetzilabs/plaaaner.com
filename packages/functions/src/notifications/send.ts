import { prefixed_cuid2 } from "@oetzilabs-plaaaner-com/core/src/custom_cuid2";
import { Notifications, Notify } from "@oetzilabs-plaaaner-com/core/src/entities/notifications";
import { WebsocketCore } from "@oetzilabs-plaaaner-com/core/src/entities/websocket";
import { ApiHandler, usePathParam } from "sst/node/api";
import { z } from "zod";
import { error, getUser, json } from "../utils";

export const main = ApiHandler(async (event) => {
  const user = await getUser();
  if (user instanceof Error) {
    return error("User not authenticated");
  }
  const payload = JSON.parse(event.body || "{}");
  if (!payload) {
    return error("No payload");
  }

  const valid = z.custom<Omit<Notify, "id">>().safeParse(payload);
  if (!valid.success) {
    return error("Invalid payload");
  }

  // const notification = await Notifications.create(valid.data);

  // const x = await WebsocketCore.broadcast(notification);

  return error("Not implemented.");
});

export const dismiss = ApiHandler(async (event) => {
  const user = await getUser();
  if (user instanceof Error) {
    return error("User not authenticated");
  }
  const nid = usePathParam("nid");
  if (!nid) {
    return error("No payload");
  }

  const valid = prefixed_cuid2.safeParse(nid);
  if (!valid.success) {
    return error("Invalid payload");
  }

  const x = await Notifications.dismiss(user.id, valid.data);

  return json(x);
});

export const dismissAll = ApiHandler(async (event) => {
  const user = await getUser();
  if (user instanceof Error) {
    return error("User not authenticated");
  }

  const x = await Notifications.dismissAll(user.id);

  return json({
    message: "Notification dismissed",
    x,
  });
});
