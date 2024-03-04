import { relations } from "drizzle-orm";
import { uuid } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { Entity } from "./entity";
import { notifications } from "./notifications";
import { organizations } from "./organization";
import { schema } from "./utils";

export const organizations_notifications = schema.table("organizations_notifications", {
  ...Entity.defaults,
  organization_id: uuid("organization_id")
    .references(() => organizations.id)
    .notNull(),
  notification_id: uuid("notification_id")
    .references(() => notifications.id)
    .notNull(),
});

export const organizations_notifications_relation = relations(organizations_notifications, ({ many, one }) => ({
  organization: one(organizations, {
    fields: [organizations_notifications.organization_id],
    references: [organizations.id],
  }),
  notification: one(notifications, {
    fields: [organizations_notifications.notification_id],
    references: [notifications.id],
  }),
}));

export type OrganizationNotificationSelect = typeof organizations_notifications.$inferSelect;
export type OrganizationNotificationInsert = typeof organizations_notifications.$inferInsert;

export const OrganizationNotificationCreateSchema = createInsertSchema(organizations_notifications);
export const OrganizationNotificationUpdateSchema = OrganizationNotificationCreateSchema.partial()
  .omit({ createdAt: true, updatedAt: true })
  .extend({
    id: z.string().uuid(),
  });

