import { text, uuid } from "drizzle-orm/pg-core";
import { Entity } from "./entity";
import { schema } from "./utils";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";
import { plans } from "./plans";
import { users } from "./users";

export const plan_types = schema.table("plan_types", {
  ...Entity.defaults,
  name: text("name").notNull(),
  description: text("description"),
  owner_id: uuid("owner").references(() => users.id),
});

export const plan_types_relation = relations(plan_types, ({ many, one }) => ({
  events: many(plans),
  owner: one(users, {
    fields: [plan_types.owner_id],
    references: [users.id],
  }),
}));

export type PlanTypeSelect = typeof plan_types.$inferSelect;
export type PlanTypeInsert = typeof plan_types.$inferInsert;

export const PlanTypeCreateSchema = createInsertSchema(plan_types);
export const PlanTypeUpdateSchema = PlanTypeCreateSchema.partial().omit({ createdAt: true, updatedAt: true }).extend({
  id: z.string().uuid(),
});
