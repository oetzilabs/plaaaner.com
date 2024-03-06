import { relations } from "drizzle-orm";
import { timestamp, uuid } from "drizzle-orm/pg-core";
import { Entity } from "../entity";
import { users } from "../users";
import { schema } from "../utils";
import { system_notifications } from "./system";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const user_dismissed_system_notifications = schema.table("user_dismissed_system_notifications", {
  ...Entity.defaults,
  notificationId: uuid("notification_id")
    .notNull()
    .references(() => system_notifications.id, { onDelete: "cascade" }),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  dismissedAt: timestamp("dismissed_at", {
    withTimezone: true,
    mode: "date",
  }),
});

export type UserDismissedSystemNotificationsSelect = typeof user_dismissed_system_notifications.$inferSelect;
export type UserDismissedSystemNotificationsInsert = typeof user_dismissed_system_notifications.$inferInsert;

export const user_dismissed_notificationsRelation = relations(user_dismissed_system_notifications, ({ one }) => ({
  systemNotification: one(system_notifications, {
    fields: [user_dismissed_system_notifications.notificationId],
    references: [system_notifications.id],
  }),
  user: one(users, {
    fields: [user_dismissed_system_notifications.userId],
    references: [users.id],
  }),
}));

export const UserDismissedSystemNotificationCreateSchema = createInsertSchema(user_dismissed_system_notifications);
export const UserDismissedSystemNotificationUpdateSchema = UserDismissedSystemNotificationCreateSchema.partial()
  .omit({ createdAt: true, updatedAt: true })
  .extend({
    id: z.string().uuid(),
  });
