import { relations } from "drizzle-orm";
import { text, varchar } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { prefixed_cuid2 } from "../../../custom_cuid2";
import { commonTable } from "./entity";
import { organizations_ticket_types } from "./organizations_ticket_types";
import { users_organizations } from "./user_organizations";
import { users } from "./users";
import { workspaces_organizations } from "./workspaces_organizations";

export const organizations = commonTable(
  "organizations",
  {
    name: text("name").notNull(),
    owner_id: varchar("owner")
      .references(() => users.id, { onDelete: "cascade" })
      .notNull(),
  },
  "org",
);

export const organizations_relation = relations(organizations, ({ many, one }) => ({
  owner: one(users, {
    fields: [organizations.owner_id],
    references: [users.id],
  }),
  workspaces: many(workspaces_organizations),
  users: many(users_organizations),
  ticket_types: many(organizations_ticket_types),
}));

export type OrganizationSelect = typeof organizations.$inferSelect;
export type OrganizationInsert = typeof organizations.$inferInsert;

export const OrganizationCreateSchema = createInsertSchema(organizations).omit({
  owner_id: true,
});
export const OrganizationUpdateSchema = OrganizationCreateSchema.partial()
  .omit({ createdAt: true, updatedAt: true })
  .extend({
    id: prefixed_cuid2,
  });
