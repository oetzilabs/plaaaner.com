import { uuid } from "drizzle-orm/pg-core";
import { Entity } from "./entity";
import { schema } from "./utils";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";
import { organizations } from "./organization";
import { users } from "./users";

export const users_organizations = schema.table("users_organizations", {
  ...Entity.defaults,
  organization_id: uuid("organization_id").references(() => organizations.id),
  user_id: uuid("user_id").references(() => users.id),
});

export const users_organizations_relation = relations(users_organizations, ({ many, one }) => ({
  organization: one(organizations, {
    fields: [users_organizations.organization_id],
    references: [organizations.id],
  }),
  user: one(users, {
    fields: [users_organizations.user_id],
    references: [users.id],
  }),
}));

export type UserOrganizationSelect = typeof users_organizations.$inferSelect;
export type UserOrganizationInsert = typeof users_organizations.$inferInsert;

export const UserOrganizationCreateSchema = createInsertSchema(users_organizations);
export const UserOrganizationUpdateSchema = UserOrganizationCreateSchema.partial()
  .omit({ createdAt: true, updatedAt: true })
  .extend({
    id: z.string().uuid(),
  });

