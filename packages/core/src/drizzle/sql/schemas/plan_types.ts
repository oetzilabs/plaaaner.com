import { relations } from "drizzle-orm";
import { text, uuid, varchar } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { prefixed_cuid2 } from "../../../custom_cuid2";
import { commonTable, Entity } from "./entity";
import { plans } from "./plans";
import { users } from "./users";
import { schema } from "./utils";

export const plan_types = commonTable(
  "plan_types",
  {
    name: text("name").notNull(),
    description: text("description"),
    owner_id: varchar("owner").references(() => users.id, { onDelete: "cascade" }),
  },
  "plan_type",
);

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
  id: prefixed_cuid2,
});
