import { and, eq, inArray, isNull, notInArray, sql } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { db } from "../drizzle/sql";
import {
  SystemNotificationCreateSchema,
  SystemNotificationUpdateSchema,
  system_notifications,
  user_dismissed_system_notifications,
} from "../drizzle/sql/schema";
import { Topic } from "sst/node/topic";
import { SNS } from "@aws-sdk/client-sns";

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

export const createSystemNotification = z
  .function(z.tuple([SystemNotificationCreateSchema, z.string().uuid()]))
  .implement(async (input, reference_id) => {
    const [x] = await db.insert(system_notifications).values(input).returning();

    return x;
  });

export const createWorkspaceNotification = z
  .function(z.tuple([SystemNotificationCreateSchema, z.string().uuid()]))
  .implement(async (input, reference_id) => {
    const [x] = await db.insert(system_notifications).values(input).returning();

    return x;
  });

export const createOrganizationNotification = z
  .function(z.tuple([SystemNotificationCreateSchema, z.string().uuid()]))
  .implement(async (input, reference_id) => {
    const [x] = await db.insert(system_notifications).values(input).returning();

    return x;
  });

export const countAll = z.function(z.tuple([])).implement(async () => {
  const [x] = await db
    .select({
      count: sql`COUNT(${system_notifications.id})`,
    })
    .from(system_notifications);
  return x.count;
});

export const findById = z.function(z.tuple([z.string().uuid()])).implement(async (input) => {
  return db.query.system_notifications.findFirst({
    where: (notifications, operations) => operations.eq(notifications.id, input),
  });
});

export const findByOrganizationId = z.function(z.tuple([z.string().uuid()])).implement(async (input) => {
  const org_notifications = await db.query.organizations_notifications.findMany({
    where: (fields, operations) => operations.eq(fields.organization_id, input),
  });

  return org_notifications;
});

export const allNonDeleted = z.function(z.tuple([])).implement(async () => {
  return db.query.system_notifications.findMany({
    with: {},
    where(fields, operations) {
      return operations.isNull(fields.deletedAt);
    },
  });
});

export const all = z.function(z.tuple([])).implement(async () => {
  return db.query.system_notifications.findMany({
    with: {},
  });
});

export const update = z
  .function(
    z.tuple([
      createInsertSchema(system_notifications)
        .partial()
        .omit({ createdAt: true, updatedAt: true })
        .merge(z.object({ id: z.string().uuid() })),
    ])
  )
  .implement(async (input) => {
    const [updatedOrganization] = await db
      .update(system_notifications)
      .set({ ...input, updatedAt: new Date() })
      .where(eq(system_notifications.id, input.id))
      .returning();
    return updatedOrganization;
  });

export const markAsDeleted = z.function(z.tuple([z.object({ id: z.string().uuid() })])).implement(async (input) => {
  return update({ id: input.id, deletedAt: new Date() });
});

export const sendMissingSystemNotifications = z.function(z.tuple([z.string().uuid()])).implement(async (userId) => {
  const _notifications = await db.select({ id: system_notifications.id }).from(system_notifications);
  const notificationsIds = _notifications.map((x) => x.id);
  const dismissedNotifications = await db
    .select({ notificationId: user_dismissed_system_notifications.notificationId })
    .from(user_dismissed_system_notifications)
    .where(
      and(
        eq(user_dismissed_system_notifications.userId, userId),
        inArray(user_dismissed_system_notifications.notificationId, notificationsIds)
      )
    );

  const notificationsToSend = _notifications.filter(
    (x) => !dismissedNotifications.find((y) => y.notificationId === x.id)
  );
  return notificationsToSend;
});

export const publish = z.function(z.tuple([z.custom<Notify>()])).implement(async (n) => {
  const sns = new SNS();
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
    const [x] = await db
      .insert(user_dismissed_system_notifications)
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
    .select({ id: user_dismissed_system_notifications.notificationId })
    .from(user_dismissed_system_notifications)
    .where(eq(user_dismissed_system_notifications.userId, userId));
  const notificationsIds = dismissedNotifications.map((x) => x.id);
  if (!notificationsIds.length) {
    // check if there are any notifications
    const __notifications = await db.select().from(system_notifications);
    if (!__notifications.length) {
      // no notifications, nothing to dismiss
      return [];
    }
    // no dismissed notifications, dismiss all
    const newDismissedNotifications = [];
    for (let i = 0; i < __notifications.length; i++) {
      const [x] = await db
        .insert(user_dismissed_system_notifications)
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
    .select({ notificationId: system_notifications.id })
    .from(system_notifications)
    .where(notInArray(system_notifications.id, notificationsIds));
  const newDismissedNotifications = [];
  for (let i = 0; i < toDismiss.length; i++) {
    const [x] = await db
      .insert(user_dismissed_system_notifications)
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

export const safeParseCreate = SystemNotificationCreateSchema.safeParse;
export const safeParseUpdate = SystemNotificationUpdateSchema.safeParse;

export type Frontend = NonNullable<Awaited<ReturnType<typeof findById>>>;
