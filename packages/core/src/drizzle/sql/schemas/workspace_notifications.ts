import { relations } from "drizzle-orm";
import { uuid } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { Entity } from "./entity";
import { notifications } from "./notifications";
import { workspaces } from "./workspaces";
import { schema } from "./utils";

export const workspaces_notifications = schema.table("workspaces_notifications", {
  ...Entity.defaults,
  workspace_id: uuid("workspace_id")
    .references(() => workspaces.id)
    .notNull(),
  notification_id: uuid("notification_id")
    .references(() => notifications.id)
    .notNull(),
});

export const workspaces_notifications_relation = relations(workspaces_notifications, ({ many, one }) => ({
  workspace: one(workspaces, {
    fields: [workspaces_notifications.workspace_id],
    references: [workspaces.id],
  }),
  notification: one(notifications, {
    fields: [workspaces_notifications.notification_id],
    references: [notifications.id],
  }),
}));

export type WorkspaceNotificationSelect = typeof workspaces_notifications.$inferSelect;
export type WorkspaceNotificationInsert = typeof workspaces_notifications.$inferInsert;

export const WorkspaceNotificationCreateSchema = createInsertSchema(workspaces_notifications);
export const WorkspaceNotificationUpdateSchema = WorkspaceNotificationCreateSchema.partial()
  .omit({ createdAt: true, updatedAt: true })
  .extend({
    id: z.string().uuid(),
  });

