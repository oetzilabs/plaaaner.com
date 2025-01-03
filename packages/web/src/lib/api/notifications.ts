import { Notifications } from "@oetzilabs-plaaaner-com/core/src/entities/notifications";
import { cache, redirect } from "@solidjs/router";
import { getEvent } from "vinxi/http";
import { lucia } from "../auth";
import { getContext } from "../auth/context";

export const getNotificationSettings = cache(async () => {
  "use server";

  const [ctx, event] = await getContext();
  if (!ctx) throw redirect("/auth/login");
  if (!ctx.user) throw redirect("/auth/login");
  return {
    type: "everything",
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  // const n = await Notifications.findManyByUserId(user.id);
  // return n;
}, "notification-settings");

export const getNotifications = cache(async () => {
  "use server";

  const [ctx, event] = await getContext();
  if (!ctx) {
    throw redirect("/auth/login");
  }

  if (!ctx.session) {
    console.error("Unauthorized");
    throw redirect("/auth/login");
  }

  if (!ctx.user) {
    throw redirect("/auth/login");
  }

  if (!ctx.session.organization_id) {
    console.error("Unauthorized");
    throw redirect("/setup/organization");
  }

  const orgNotifications = await Notifications.findByOrganizationId(ctx.session.organization_id);

  return orgNotifications;
  // const n = await Notifications.findManyByUserId(user.id);
  // return n;
}, "notifications");

export const getNotificationsCount = cache(async () => {
  "use server";
  const event = getEvent()!;

  if (!event.context.session) {
    throw redirect("/auth/login");
  }

  const session = event.context.session;

  if (!session.organization_id) {
    throw redirect("/setup/organization");
  }

  if (!event.context.user) {
    throw redirect("/auth/login");
  }

  const user = event.context.user;

  const orgNotificationsCount = await Notifications.countByOrganizationId(session.organization_id);

  return orgNotificationsCount;
}, "notifications-count");
