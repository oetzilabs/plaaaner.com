import { relations } from "drizzle-orm";
import { timestamp, uuid } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { Entity } from "./entity";
import { plans } from "./plans";
import { schema } from "./utils";

export const plan_times = schema.table("plan_times", {
  ...Entity.defaults,
  plan_id: uuid("plan_id")
    .references(() => plans.id)
    .notNull(),
  starts_at: timestamp("starts_at", {
    withTimezone: true,
    mode: "date",
  }).notNull(),
  ends_at: timestamp("ends_at", {
    withTimezone: true,
    mode: "date",
  }).notNull(),
});

export const plan_times_relation = relations(plan_times, ({ many, one }) => ({
  plan: one(plans, {
    fields: [plan_times.plan_id],
    references: [plans.id],
  }),
}));

export type PlanTimesSelect = typeof plan_times.$inferSelect;
export type PlanTimesInsert = typeof plan_times.$inferInsert;

export const PlanTimesCreateSchema = createInsertSchema(plan_times);
export const PlanTimesUpdateSchema = PlanTimesCreateSchema.partial()
  .omit({ createdAt: true, updatedAt: true })
  .extend({
    id: z.string().uuid(),
  });
