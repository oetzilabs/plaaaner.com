import { text, uuid } from "drizzle-orm/pg-core";
import { Entity } from "./entity";
import { schema } from "./utils";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";
import { users_workspaces } from "./users_workspaces";
import { users } from "./users";

export const workspaces = schema.table("workspaces", {
  ...Entity.defaults,
  name: text("name").notNull(),
  owner_id: uuid("owner").references(() => users.id),
});

export const workspacesRelation = relations(workspaces, ({ many, one }) => ({
  users: many(users_workspaces),
  owner: one(users, {
    fields: [workspaces.owner_id],
    references: [users.id],
  }),
}));

export type WorkspaceSelect = typeof workspaces.$inferSelect;
export type WorkspaceInsert = typeof workspaces.$inferInsert;

export const WorkspaceCreateSchema = createInsertSchema(workspaces);
export const WorkspaceUpdateSchema = WorkspaceCreateSchema.partial().omit({ createdAt: true, updatedAt: true }).extend({
  id: z.string().uuid(),
});
