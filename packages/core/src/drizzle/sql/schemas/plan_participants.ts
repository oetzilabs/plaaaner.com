import { relations } from "drizzle-orm";
import { varchar } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { prefixed_cuid2 } from "../../../custom_cuid2";
import { commonTable } from "./entity";
import { plans } from "./plans";
import { users } from "./users";

export const plan_participants = commonTable(
  "plan_participants",
  {
    participant_id: varchar("participant_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    plan_id: varchar("plan_id")
      .notNull()
      .references(() => plans.id, { onDelete: "cascade" }),
  },
  "plan_participant",
);

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
    id: prefixed_cuid2,
  });
