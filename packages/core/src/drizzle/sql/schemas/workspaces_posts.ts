import { relations } from "drizzle-orm";
import { primaryKey, timestamp, uuid } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { posts } from "./posts";
import { schema } from "./utils";
import { workspaces } from "./workspaces";

export const workspaces_posts = schema.table(
  "workspaces_posts",
  {
    workspace_id: uuid("workspace_id")
      .references(() => workspaces.id, { onDelete: "cascade" })
      .notNull(),
    post_id: uuid("post_id")
      .references(() => posts.id, { onDelete: "cascade" })
      .notNull(),
    createdAt: timestamp("created_at", {
      withTimezone: true,
      mode: "date",
    })
      .notNull()
      .defaultNow(),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.workspace_id, table.post_id] }),
  })
);

export const workspaces_posts_relation = relations(workspaces_posts, ({ many, one }) => ({
  workspace: one(workspaces, {
    fields: [workspaces_posts.workspace_id],
    references: [workspaces.id],
  }),
  post: one(posts, {
    fields: [workspaces_posts.post_id],
    references: [posts.id],
  }),
}));

export type WorkspacePostSelect = typeof workspaces_posts.$inferSelect;
export type WorkspacePostInsert = typeof workspaces_posts.$inferInsert;

export const WorkspacePostCreateSchema = createInsertSchema(workspaces_posts);
export const WorkspacePostUpdateSchema = WorkspacePostCreateSchema.partial()
  .omit({ createdAt: true, updatedAt: true })
  .extend({
    id: z.string().uuid(),
  });
