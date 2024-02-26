import { timestamp, uuid, pgEnum } from "drizzle-orm/pg-core";
import { Entity } from "./entity";
import { schema } from "./utils";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";
import { organizations } from "./organization";
import { users } from "./users";

export const joinType = pgEnum('joinType', ["request", "invite"]);

export const organizations_joins = schema.table("organizations_joins", {
  ...Entity.defaults,
  organization_id: uuid("organization_id").references(() => organizations.id).notNull(),
  user_id: uuid("user_id").references(() => users.id).notNull(),
  type: joinType("type").notNull(),
  expiresAt: timestamp("expires_at", {
    withTimezone: true,
    mode: "date",
  }).notNull(),
});

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
    id: z.string().uuid(),
  });
