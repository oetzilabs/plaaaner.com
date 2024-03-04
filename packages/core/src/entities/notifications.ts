import { and, eq, inArray, isNull, notInArray, sql } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { db } from "../drizzle/sql";
import {
  NotificationCreateSchema,
  NotificationUpdateSchema,
  notification_types,
  notifications,
  user_dismissed_notifications,
} from "../drizzle/sql/schema";
import { Topic } from "sst/node/topic";

export * as Notifications from "./notifications";

type NotificationStatistics = "ping" | "pong";

type NotificationEntity = "system" | "user" | "company";
type NotificationAction = "info" | "warning" | "error";
type NotificationType = `${NotificationEntity}:${NotificationAction}` | NotificationStatistics;

export type Notify = {
  id: string;
  type: NotificationType;
  title: string;
  content: string;
  dismissedAt: Date | null;
};

export const create = z
  .function(z.tuple([NotificationCreateSchema, z.string().uuid()]))
  .implement(async (userInput, reference_id) => {
    const [x] = await db
      .insert(notifications)
      .values({ ...userInput, reference_id: reference_id })
      .returning();

    return x;
  });

export const countAll = z.function(z.tuple([])).implement(async () => {
  const [x] = await db
    .select({
      count: sql`COUNT(${notifications.id})`,
    })
    .from(notifications);
  return x.count;
});

export const findById = z.function(z.tuple([z.string().uuid()])).implement(async (input) => {
  return db.query.notifications.findFirst({
    where: (notifications, operations) => operations.eq(notifications.id, input),
  });
});

export const findOrganizationById = z.function(z.tuple([z.string().uuid()])).implement(async (input) => {
  const org_notifications = await db.query.organizations_notifications.findMany({
    where: (notifications, operations) => operations.eq(notifications.organization_id, input),
    with: {
      notification: true,
    },
  });

  return org_notifications.map((on) => on.notification);
});

export const allNonDeleted = z.function(z.tuple([])).implement(async () => {
  return db.query.notifications.findMany({
    with: {},
    where(fields, operations) {
      return operations.isNull(fields.deletedAt);
    },
  });
});

export const all = z.function(z.tuple([])).implement(async () => {
  return db.query.notifications.findMany({
    with: {},
  });
});

export const update = z
  .function(
    z.tuple([
      createInsertSchema(notifications)
        .partial()
        .omit({ createdAt: true, updatedAt: true })
        .merge(z.object({ id: z.string().uuid() })),
    ])
  )
  .implement(async (input) => {
    const [updatedOrganization] = await db
      .update(notifications)
      .set({ ...input, updatedAt: new Date() })
      .where(eq(notifications.id, input.id))
      .returning();
    return updatedOrganization;
  });

export const markAsDeleted = z.function(z.tuple([z.object({ id: z.string().uuid() })])).implement(async (input) => {
  return update({ id: input.id, deletedAt: new Date() });
});

export const getTypeId = z.function(z.tuple([z.string()])).implement(async (t) => {
  const et = await db.query.notification_types.findFirst({
    where(fields, operators) {
      return operators.eq(fields.name, t);
    },
  });
  return et;
});

export const getDefaultTypeId = z.function(z.tuple([])).implement(async () => {
  const et = await db.query.notification_types.findFirst({
    where(fields, operators) {
      return operators.eq(fields.name, "default-notification-for-all-plans");
    },
    columns: {
      id: true,
    },
  });
  // TODO!: I have to provide a default notification type, for the case that the requested notification_type does not exist!
  if (!et) {
    throw new Error("DEFAULT NOTIFICATION IS NOT SEEDED!");
  }
  return et.id;
});

export const getAllTypes = z.function(z.tuple([])).implement(async () => {
  const all_notification_types = await db.query.notification_types.findMany({});
  return all_notification_types;
});

const sns = new SNS();

export const sendMissingNotifications = z.function(z.tuple([z.string().uuid()])).implement(async (userId) => {
  // get all notifications
  // get all dismissed notifications
  // filter out dismissed notifications
  // send remaining notifications
  const _notifications = await db.select().from(notifications);
  const notificationsIds = _notifications.map((x) => x.id);
  const dismissedNotifications = await db
    .select({ notificationId: user_dismissed_notifications.notificationId })
    .from(user_dismissed_notifications)
    .where(eq(user_dismissed_notifications.userId, userId))
    .where(inArray(user_dismissed_notifications.notificationId, notificationsIds));
  const notificationsToSend = _notifications.filter(
    (x) => !dismissedNotifications.find((y) => y.notificationId === x.id)
  );
  return notificationsToSend;
});

export const publish = z.function(z.tuple([z.custom<Notify>()])).implement(async (n) => {
  const notificationString = JSON.stringify(n);
  const x = await sns.publish({
    TopicArn: Topic["notifications"].topicArn,
    Message: notificationString,
    MessageStructure: "string",
  });
  return x;
});

export const dismiss = z
  .function(z.tuple([z.string().uuid(), z.string().uuid()]))
  .implement(async (userId, notificationId) => {
    // set dismissedAt to now
    const [x] = await db
      .insert(user_dismissed_notifications)
      .values({
        userId,
        notificationId,
        dismissedAt: new Date(),
      })
      .returning();
    return x;
  });

export const dismissAll = z.function(z.tuple([z.string().uuid()])).implement(async (userId) => {
  // set dismissedAt to now
  const dismissedNotifications = await db
    .select({ id: user_dismissed_notifications.notificationId })
    .from(user_dismissed_notifications)
    .where(eq(user_dismissed_notifications.userId, userId));
  const notificationsIds = dismissedNotifications.map((x) => x.id);
  if (!notificationsIds.length) {
    // check if there are any notifications
    const __notifications = await db.select().from(notifications);
    if (!__notifications.length) {
      // no notifications, nothing to dismiss
      return [];
    }
    // no dismissed notifications, dismiss all
    const newDismissedNotifications = [];
    for (let i = 0; i < __notifications.length; i++) {
      const [x] = await db
        .insert(user_dismissed_notifications)
        .values({
          userId,
          notificationId: __notifications[i].id,
          dismissedAt: new Date(),
        })
        .returning();
      newDismissedNotifications.push(x);
    }
    return newDismissedNotifications;
  }
  const toDismiss = await db
    .select({ notificationId: notifications.id })
    .from(notifications)
    .where(notInArray(notifications.id, notificationsIds));
  const newDismissedNotifications = [];
  for (let i = 0; i < toDismiss.length; i++) {
    const [x] = await db
      .insert(user_dismissed_notifications)
      .values({
        userId,
        notificationId: toDismiss[i].notificationId,
        dismissedAt: new Date(),
      })
      .returning();
    newDismissedNotifications.push(x);
  }
  return newDismissedNotifications;
});

export const safeParseCreate = NotificationCreateSchema.safeParse;
export const safeParseUpdate = NotificationUpdateSchema.safeParse;

export type Frontend = NonNullable<Awaited<ReturnType<typeof findById>>>;
