import { relations } from "drizzle-orm";
import { primaryKey, timestamp, uuid, varchar } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { prefixed_cuid2 } from "../../../custom_cuid2";
import { Entity } from "./entity";
import { organizations } from "./organization";
import { users } from "./users";
import { schema } from "./utils";

export const users_organizations = schema.table(
  "users_organizations",
  {
    organization_id: varchar("organization_id")
      .references(() => organizations.id, { onDelete: "cascade" })
      .notNull(),
    user_id: varchar("user_id")
      .references(() => users.id, { onDelete: "cascade" })
      .notNull(),
    joinedAt: timestamp("joined_at", { mode: "date", withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.user_id, table.organization_id] }),
  }),
);

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
export const UserOrganizationUpdateSchema = UserOrganizationCreateSchema.partial().extend({
  id: prefixed_cuid2,
});
