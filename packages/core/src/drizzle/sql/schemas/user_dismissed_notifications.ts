import { relations } from "drizzle-orm";
import { text, timestamp, uuid } from "drizzle-orm/pg-core";
import { Entity } from "./entity";
import { notifications } from "./notifications";
import { schema } from "./utils";
import { users } from "./users";

export const user_dismissed_notifications = schema.table("user_dismissed_notifications", {
  ...Entity.defaults,
  notificationId: uuid("notification_id")
    .notNull()
    .references(() => notifications.id, { onDelete: "cascade" }),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  dismissedAt: timestamp("dismissed_at", {
    withTimezone: true,
    mode: "date",
  }),
});

export type UserDismissedNotificationsSelect = typeof user_dismissed_notifications.$inferSelect;
export type UserDismissedNotificationsInsert = typeof user_dismissed_notifications.$inferInsert;

export const user_dismissed_notificationsRelation = relations(user_dismissed_notifications, ({ one }) => ({
  notification: one(notifications, {
    fields: [user_dismissed_notifications.notificationId],
    references: [notifications.id],
  }),
  user: one(users, {
    fields: [user_dismissed_notifications.userId],
    references: [users.id],
  }),
}));

