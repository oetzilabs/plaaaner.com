import { uuid } from "drizzle-orm/pg-core";
import { Entity } from "./entity";
import { schema } from "./utils";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { users } from "./users";
import { plans } from "./plans";
import { relations } from "drizzle-orm";

export const plan_participants = schema.table("plan_participants", {
  ...Entity.defaults,
  participant_id: uuid("participant_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  plan_id: uuid("plan_id")
    .notNull()
    .references(() => plans.id, { onDelete: "cascade" }),
});

export const plan_participants_relation = relations(plan_participants, ({ one }) => ({
  user: one(users, {
    fields: [plan_participants.participant_id],
    references: [users.id],
  }),
  workspace: one(plans, {
    fields: [plan_participants.plan_id],
    references: [plans.id],
  }),
}));

export type PlanParticipantsSelect = typeof plan_participants.$inferSelect;
export type PlanParticipantsInsert = typeof plan_participants.$inferInsert;
export const PlanParticipantsUpdate = createInsertSchema(plan_participants)
  .partial()
  .omit({ createdAt: true, updatedAt: true })
  .extend({
    id: z.string().uuid(),
  });
