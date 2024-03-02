import { text, timestamp, uuid } from "drizzle-orm/pg-core";
import { Entity } from "./entity";
import { schema } from "./utils";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";
import { users } from "./users";
import { plan_types } from "./plan_types";
import { organizations_plans } from "./organizations_plans";
import { plan_times } from "./plan_times";

export const plans = schema.table("plans", {
  ...Entity.defaults,
  name: text("name").notNull(),
  description: text("description"),
  plan_type_id: uuid("plan_type_id")
    .notNull()
    .references(() => plan_types.id),
  owner_id: uuid("owner").references(() => users.id),
  starts_at: timestamp("starts_at", {
    withTimezone: true,
    mode: "date",
  }).notNull(),
  ends_at: timestamp("ends_at", {
    withTimezone: true,
    mode: "date",
  }).notNull(),
});

export const plans_relation = relations(plans, ({ many, one }) => ({
  plan_type: one(plan_types, {
    fields: [plans.plan_type_id],
    references: [plan_types.id],
  }),
  owner: one(users, {
    fields: [plans.owner_id],
    references: [users.id],
  }),
  organizations: many(organizations_plans),
  times: many(plan_times),
}));

export type PlanSelect = typeof plans.$inferSelect;
export type PlanInsert = typeof plans.$inferInsert;

export const PlanCreateSchema = createInsertSchema(plans);
export const PlanUpdateSchema = PlanCreateSchema.partial().omit({ createdAt: true, updatedAt: true }).extend({
  id: z.string().uuid(),
});
