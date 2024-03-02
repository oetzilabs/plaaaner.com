import { relations } from "drizzle-orm";
import { uuid } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { Entity } from "./entity";
import { plans } from "./plans";
import { organizations } from "./organization";
import { schema } from "./utils";

export const organizations_plans = schema.table("organizations_plans", {
  ...Entity.defaults,
  organization_id: uuid("organization_id")
    .references(() => organizations.id)
    .notNull(),
  plan_id: uuid("plan_id")
    .references(() => plans.id)
    .notNull(),
});

export const organizations_plans_relation = relations(organizations_plans, ({ many, one }) => ({
  organization: one(organizations, {
    fields: [organizations_plans.organization_id],
    references: [organizations.id],
  }),
  plan: one(plans, {
    fields: [organizations_plans.plan_id],
    references: [plans.id],
  }),
}));

export type OrganizationPlanSelect = typeof organizations_plans.$inferSelect;
export type OrganizationPlanInsert = typeof organizations_plans.$inferInsert;

export const OrganizationPlanCreateSchema = createInsertSchema(organizations_plans);
export const OrganizationPlanUpdateSchema = OrganizationPlanCreateSchema.partial()
  .omit({ createdAt: true, updatedAt: true })
  .extend({
    id: z.string().uuid(),
  });
