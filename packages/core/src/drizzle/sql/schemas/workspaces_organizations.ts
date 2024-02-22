import { uuid } from "drizzle-orm/pg-core";
import { Entity } from "./entity";
import { schema } from "./utils";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";
import { organizations } from "./organization";
import { workspaces } from "./workspaces";

export const workspaces_organizations = schema.table("workspaces_organizations", {
  ...Entity.defaults,
  organization_id: uuid("organization_id").references(() => organizations.id),
  workspace_id: uuid("workspace_id").references(() => workspaces.id),
});

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
  .omit({ createdAt: true, updatedAt: true })
  .extend({
    id: z.string().uuid(),
  });
