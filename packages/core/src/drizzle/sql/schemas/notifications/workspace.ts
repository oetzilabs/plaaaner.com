import { relations } from "drizzle-orm";
import { text, varchar } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { prefixed_cuid2 } from "../../../../custom_cuid2";
import { commonTable } from "../entity";
import { workspaces } from "../workspaces";

export const workspaces_notifications = commonTable(
  "workspaces_notifications",
  {
    workspace_id: varchar("workspace_id")
      .references(() => workspaces.id)
      .notNull(),
    title: text("title").notNull(),
    content: text("content").notNull(),
  },
  "workspace_notification",
);

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
    id: prefixed_cuid2,
  });
