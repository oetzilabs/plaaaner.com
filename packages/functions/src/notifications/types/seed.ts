import { ApiHandler } from "sst/node/api";
import { NotificationTypes } from "@oetzilabs-plaaaner-com/core/src/entities/notification_types";
import { error, getUser, json } from "../../utils";
import { StatusCodes } from "http-status-codes";

export const main = ApiHandler(async () => {
  const createdNotifications = await NotificationTypes.create(NotificationTypes.DEFAULT_TICKET_TYPES, null);
  return json(createdNotifications);
});

export const upsert = ApiHandler(async () => {
  const createdNotifications = await NotificationTypes.upsert(NotificationTypes.DEFAULT_TICKET_TYPES, null);
  return json(createdNotifications);
});

