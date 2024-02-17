import { text } from "drizzle-orm/pg-core";
import { Entity } from "./entity";
import { schema } from "./utils";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";
import { users_workspaces } from "./users_workspaces";

export const workspaces = schema.table("workspaces", {
  ...Entity.defaults,
  name: text("name").notNull(),
});

export const workspacesRelation = relations(workspaces, ({ many }) => ({
  users: many(users_workspaces),
}));

export type WorkspaceSelect = typeof workspaces.$inferSelect;
export type WorkspaceInsert = typeof workspaces.$inferInsert;
export const WorkspaceUpdate = createInsertSchema(workspaces)
  .partial()
  .omit({ createdAt: true, updatedAt: true })
  .extend({
    id: z.string().uuid(),
  });
