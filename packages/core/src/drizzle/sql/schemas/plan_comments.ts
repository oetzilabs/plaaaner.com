import { relations } from "drizzle-orm";
import { text, varchar } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { prefixed_cuid2 } from "../../../custom_cuid2";
import { commonTable } from "./entity";
import { plan_comments_mentions } from "./plan_comments_mentions";
import { plans } from "./plans";
import { users } from "./users";

export const plan_comments = commonTable(
  "plan_comments",
  {
    planId: varchar("plan_id")
      .references(() => plans.id, { onDelete: "cascade" })
      .notNull(),
    userId: varchar("user_id")
      .references(() => users.id, { onDelete: "cascade" })
      .notNull(),
    comment: text("comment").notNull(),
  },
  "plan_comment",
);

export const plan_comments_relation = relations(plan_comments, ({ many, one }) => ({
  plan: one(plans, {
    fields: [plan_comments.planId],
    references: [plans.id],
  }),
  user: one(users, {
    fields: [plan_comments.userId],
    references: [users.id],
  }),
  mentions: many(plan_comments_mentions),
}));

export type PlanCommentsSelect = typeof plan_comments.$inferSelect;
export type PlanCommentsInsert = typeof plan_comments.$inferInsert;

export const PlanCommentsCreateSchema = createInsertSchema(plan_comments);
export const PlanCommentsUpdateSchema = PlanCommentsCreateSchema.partial()
  .omit({ createdAt: true, updatedAt: true })
  .extend({
    id: prefixed_cuid2,
  });
