import { relations } from "drizzle-orm";
import { primaryKey, timestamp, uuid, varchar } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { prefixed_cuid2 } from "../../../custom_cuid2";
import { users } from "./users";
import { schema } from "./utils";
import { workspaces } from "./workspaces";

export const users_workspaces = schema.table(
  "users_workspaces",
  {
    user_id: varchar("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    workspace_id: varchar("workspace_id")
      .notNull()
      .references(() => workspaces.id, { onDelete: "cascade" }),

    createdAt: timestamp("created_at", {
      withTimezone: true,
      mode: "date",
    })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", {
      withTimezone: true,
      mode: "date",
    }),
    deletedAt: timestamp("deleted_at", {
      withTimezone: true,
      mode: "date",
    }),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.workspace_id, table.user_id] }),
  }),
);

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
export const UsersWorkspaceUpdate = createInsertSchema(users_workspaces).partial().omit({ createdAt: true }).extend({
  id: prefixed_cuid2,
});
