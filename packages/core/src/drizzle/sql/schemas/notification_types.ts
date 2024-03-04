import { pgEnum, text, uuid } from "drizzle-orm/pg-core";
import { Entity } from "./entity";
import { schema } from "./utils";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";
import { users } from "./users";
import { notifications } from "./notifications";

export const notification_types = schema.table("notification_types", {
  ...Entity.defaults,
  name: text("name").notNull(),
  description: text("description"),
  owner_id: uuid("owner").references(() => users.id),
});

export const notification_types_relation = relations(notification_types, ({ many, one }) => ({
  notifications: many(notifications),
  owner: one(users, {
    fields: [notification_types.owner_id],
    references: [users.id],
  }),
}));

export type NotificationTypeSelect = typeof notification_types.$inferSelect;
export type NotificationTypeInsert = typeof notification_types.$inferInsert;

export const NotificationTypeCreateSchema = createInsertSchema(notification_types).omit({ owner_id: true });
export const NotificationTypeUpdateSchema = NotificationTypeCreateSchema.partial()
  .omit({ createdAt: true, updatedAt: true })
  .extend({
    id: z.string().uuid(),
  });

