import { relations } from "drizzle-orm";
import { text } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { Entity } from "../entity";
import { schema } from "../utils";
import { user_dismissed_system_notifications } from "./user_dismissed";

export const system_notifications = schema.table("system_notifications", {
  ...Entity.defaults,
  title: text("title").notNull(),
  content: text("content").notNull(),
});

export const system_notificationsRelation = relations(system_notifications, ({ many }) => ({
  dismissedByusers: many(user_dismissed_system_notifications),
}));

export type SystemNotificationSelect = typeof system_notifications.$inferSelect;
export type SystemNotificationInsert = typeof system_notifications.$inferInsert;

export const SystemNotificationCreateSchema = createInsertSchema(system_notifications);
export const SystemNotificationUpdateSchema = SystemNotificationCreateSchema.partial()
  .omit({ createdAt: true, updatedAt: true })
  .extend({
    id: z.string().uuid(),
  });
