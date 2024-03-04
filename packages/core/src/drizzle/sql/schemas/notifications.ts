import { json, pgEnum, primaryKey, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { Entity } from "./entity";
import { schema } from "./utils";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";
import { notification_mentions } from "./notification_mentions";

export const notifications = schema.table("notifications", {
  ...Entity.defaults,
  title: text("title").notNull(),
  summary: text("summary"),
  reference_id: uuid("reference_id"), // referencing the underlying entity. Can be null
});


export const notifications_relation = relations(notifications, ({ many, one }) => ({
  mentions: many(notification_mentions),
}));

export type NotificationSelect = typeof notifications.$inferSelect;
export type NotificationInsert = typeof notifications.$inferInsert;

export const NotificationCreateSchema = createInsertSchema(notifications).omit({
  reference_id: true,
});
export const NotificationUpdateSchema = NotificationCreateSchema.partial()
  .omit({ createdAt: true, updatedAt: true })
  .extend({
    id: z.string().uuid(),
  });
