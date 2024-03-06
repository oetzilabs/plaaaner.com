import { relations } from "drizzle-orm";
import { text, uuid } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { Entity } from "../entity";
import { schema } from "../utils";
import { workspaces } from "../workspaces";

export const workspaces_notifications = schema.table("workspaces_notifications", {
  ...Entity.defaults,
  workspace_id: uuid("workspace_id")
    .references(() => workspaces.id)
    .notNull(),
  title: text("title").notNull(),
  content: text("content").notNull(),
});

export const workspaces_notifications_relation = relations(workspaces_notifications, ({ many, one }) => ({
  workspace: one(workspaces, {
    fields: [workspaces_notifications.workspace_id],
    references: [workspaces.id],
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
