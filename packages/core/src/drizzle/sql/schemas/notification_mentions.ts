import { timestamp, uuid, primaryKey } from "drizzle-orm/pg-core";
import { schema } from "./utils";
import { users } from "./users";
import { relations } from "drizzle-orm";
import { notifications } from "./notifications";

export const notification_mentions = schema.table(
  "notification_mentions",
  {
    createdAt: timestamp("created_at", {
      withTimezone: true,
      mode: "date",
    })
      .notNull()
      .defaultNow(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id),
    notificationId: uuid("notification_id")
      .notNull()
      .references(() => users.id),
  },
  (table) => {
    return {
      pk: primaryKey({ columns: [table.userId, table.notificationId] }),
    };
  }
);

export const notification_mentions_relations = relations(notification_mentions, ({ one }) => ({
  user: one(users, {
    fields: [notification_mentions.userId],
    references: [users.id],
  }),
  notification: one(notifications, {
    fields: [notification_mentions.notificationId],
    references: [notifications.id],
  }),
}));
