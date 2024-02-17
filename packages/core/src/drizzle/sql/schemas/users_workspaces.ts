import { text, uuid } from "drizzle-orm/pg-core";
import { Entity } from "./entity";
import { schema } from "./utils";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { users } from "./users";
import { workspaces } from "./workspaces";
import { relations } from "drizzle-orm";

export const users_workspaces = schema.table("users_workspaces", {
  ...Entity.defaults,
  user_id: uuid("user_id")
    .notNull()
    .references(() => users.id),
  workspace_id: uuid("workspace_id")
    .notNull()
    .references(() => workspaces.id),
});

export const users_workspaces_relation = relations(users_workspaces, ({ one }) => ({
  user: one(users, {
    fields: [users_workspaces.user_id],
    references: [users.id],
  }),
  workspace: one(workspaces, {
    fields: [users_workspaces.workspace_id],
    references: [workspaces.id],
  }),
}));

export type UsersWorkspaceSelect = typeof users_workspaces.$inferSelect;
export type UsersWorkspaceInsert = typeof users_workspaces.$inferInsert;
export const UsersWorkspaceUpdate = createInsertSchema(users_workspaces)
  .partial()
  .omit({ createdAt: true, updatedAt: true })
  .extend({
    id: z.string().uuid(),
  });
