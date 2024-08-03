import { relations } from "drizzle-orm";
import { text, varchar } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { prefixed_cuid2 } from "../../../../custom_cuid2";
import { commonTable } from "../entity";
import { organizations } from "../organization";

export const organizations_notifications = commonTable(
  "organizations_notifications",
  {
    organization_id: varchar("organization_id")
      .references(() => organizations.id)
      .notNull(),
    title: text("title").notNull(),
    content: text("content").notNull(),
  },
  "organization_notification",
);

export const organizations_notifications_relation = relations(organizations_notifications, ({ many, one }) => ({
  organization: one(organizations, {
    fields: [organizations_notifications.organization_id],
    references: [organizations.id],
  }),
}));

export type OrganizationNotificationSelect = typeof organizations_notifications.$inferSelect;
export type OrganizationNotificationInsert = typeof organizations_notifications.$inferInsert;

export const OrganizationNotificationCreateSchema = createInsertSchema(organizations_notifications);
export const OrganizationNotificationUpdateSchema = OrganizationNotificationCreateSchema.partial()
  .omit({ createdAt: true, updatedAt: true })
  .extend({
    id: prefixed_cuid2,
  });
