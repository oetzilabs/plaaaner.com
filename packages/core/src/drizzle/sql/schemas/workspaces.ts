import { text, uuid } from "drizzle-orm/pg-core";
import { Entity } from "./entity";
import { schema } from "./utils";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";
import { users_workspaces } from "./users_workspaces";
import { users } from "./users";
import { workspaces_organizations } from "./workspaces_organizations";
import { workspaces_plans } from "./workspaces_plans";
import { workspaces_posts } from "./workspaces_posts";

export const workspaces = schema.table("workspaces", {
  ...Entity.defaults,
  name: text("name").notNull(),
  owner_id: uuid("owner")
    .references(() => users.id, { onDelete: "cascade" })
    .notNull(),
});

export const workspacesRelation = relations(workspaces, ({ many, one }) => ({
  users: many(users_workspaces),
  owner: one(users, {
    fields: [workspaces.owner_id],
    references: [users.id],
  }),
  plans: many(workspaces_plans),
  posts: many(workspaces_posts),
  organizations: many(workspaces_organizations),
}));

export type WorkspaceSelect = typeof workspaces.$inferSelect;
export type WorkspaceInsert = typeof workspaces.$inferInsert;

export const WorkspaceCreateSchema = createInsertSchema(workspaces).omit({ owner_id: true });
export const WorkspaceUpdateSchema = WorkspaceCreateSchema.partial().omit({ createdAt: true, updatedAt: true }).extend({
  id: z.string().uuid(),
});
