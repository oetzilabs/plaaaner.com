import { text, uuid } from "drizzle-orm/pg-core";
import { Entity } from "./entity";
import { schema } from "./utils";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";
import { users } from "./users";
import { organizations_events } from "./organizations_events";
import { workspaces_organizations } from "./workspaces_organizations";
import { users_organizations } from "./user_organizations";

export const organizations = schema.table("organizations", {
  ...Entity.defaults,
  name: text("name").notNull(),
  owner_id: uuid("owner")
    .references(() => users.id)
    .notNull(),
});

export const organizations_relation = relations(organizations, ({ many, one }) => ({
  owner: one(users, {
    fields: [organizations.owner_id],
    references: [users.id],
  }),
  events: many(organizations_events),
  workspaces: many(workspaces_organizations),
  users: many(users_organizations),
}));

export type OrganizationSelect = typeof organizations.$inferSelect;
export type OrganizationInsert = typeof organizations.$inferInsert;

export const OrganizationCreateSchema = createInsertSchema(organizations).omit({
  owner_id: true,
});
export const OrganizationUpdateSchema = OrganizationCreateSchema.partial()
  .omit({ createdAt: true, updatedAt: true })
  .extend({
    id: z.string().uuid(),
  });
