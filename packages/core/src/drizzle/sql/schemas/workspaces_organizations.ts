import { relations } from "drizzle-orm";
import { primaryKey, timestamp, uuid, varchar } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { prefixed_cuid2 } from "../../../custom_cuid2";
import { organizations } from "./organization";
import { schema } from "./utils";
import { workspaces } from "./workspaces";

export const workspaces_organizations = schema.table(
  "workspaces_organizations",
  {
    organization_id: varchar("organization_id")
      .notNull()
      .references(() => organizations.id, { onDelete: "cascade" }),
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
    pk: primaryKey({ columns: [table.workspace_id, table.organization_id] }),
  }),
);

export const workspaces_organizations_relation = relations(workspaces_organizations, ({ many, one }) => ({
  organization: one(organizations, {
    fields: [workspaces_organizations.organization_id],
    references: [organizations.id],
  }),
  workspace: one(workspaces, {
    fields: [workspaces_organizations.workspace_id],
    references: [workspaces.id],
  }),
}));

export type WorkspaceOrganizationSelect = typeof workspaces_organizations.$inferSelect;
export type WorkspaceOrganizationInsert = typeof workspaces_organizations.$inferInsert;

export const WorkspaceOrganizationCreateSchema = createInsertSchema(workspaces_organizations);
export const WorkspaceOrganizationUpdateSchema = WorkspaceOrganizationCreateSchema.partial()
  .omit({ createdAt: true })
  .extend({
    id: prefixed_cuid2,
  });
