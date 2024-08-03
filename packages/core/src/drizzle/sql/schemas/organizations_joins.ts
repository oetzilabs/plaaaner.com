import { relations } from "drizzle-orm";
import { timestamp, varchar } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { prefixed_cuid2 } from "../../../custom_cuid2";
import { commonTable } from "./entity";
import { organizations } from "./organization";
import { users } from "./users";
import { schema } from "./utils";

export const joinType = schema.enum("joinType", ["request", "invite"]);

export const organizations_joins = commonTable(
  "organizations_joins",
  {
    organization_id: varchar("organization_id")
      .references(() => organizations.id, { onDelete: "cascade" })
      .notNull(),
    user_id: varchar("user_id")
      .references(() => users.id, { onDelete: "cascade" })
      .notNull(),
    type: joinType("type").notNull(),
    expiresAt: timestamp("expires_at", {
      withTimezone: true,
      mode: "date",
    }).notNull(),
  },
  "org_join",
);

export const organizations_joins_relation = relations(organizations_joins, ({ one }) => ({
  organization: one(organizations, {
    fields: [organizations_joins.organization_id],
    references: [organizations.id],
  }),
  user: one(users, {
    fields: [organizations_joins.user_id],
    references: [users.id],
  }),
}));

export type OrganizationJoinSelect = typeof organizations_joins.$inferSelect;
export type OrganizationJoinInsert = typeof organizations_joins.$inferInsert;

export const OrganizationJoinCreateSchema = createInsertSchema(organizations_joins).omit({ user_id: true });
export const OrganizationJoinUpdateSchema = OrganizationJoinCreateSchema.partial()
  .omit({ createdAt: true, updatedAt: true })
  .extend({
    id: prefixed_cuid2,
  });
