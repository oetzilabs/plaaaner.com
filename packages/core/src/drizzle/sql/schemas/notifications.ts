import { pgEnum, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { Entity } from "./entity";
import { schema } from "./utils";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";
import { notification_types } from "./notification_types";

export const notification_status = pgEnum("notification_status", ["READ", "UNREAD", "SKIPPED", "MUTED", "ARCHIVED"]);

export const notifications = schema.table("notifications", {
  ...Entity.defaults,
  summary: text("summary"), // nullable, because not every notification needs a summary.
  notification_type_id: uuid("notification_type_id")
    .notNull()
    .references(() => notification_types.id),
  reference_id: uuid("reference_id"), // referencing the underlying entity. Can be null
  status: notification_status("status").notNull().default("UNREAD"),
});

export const notifications_relation = relations(notifications, ({ many, one }) => ({
  notification_type: one(notification_types, {
    fields: [notifications.notification_type_id],
    references: [notification_types.id],
  }),
}));

export type NotificationSelect = typeof notifications.$inferSelect;
export type NotificationInsert = typeof notifications.$inferInsert;

export const NotificationCreateSchema = createInsertSchema(notifications).omit({
  reference_id: true
});
export const NotificationUpdateSchema = NotificationCreateSchema.partial()
  .omit({ createdAt: true, updatedAt: true })
  .extend({
    id: z.string().uuid(),
  });
