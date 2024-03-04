import { timestamp, uuid, primaryKey } from "drizzle-orm/pg-core";
import { schema } from "./utils";
import { users } from "./users";

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
