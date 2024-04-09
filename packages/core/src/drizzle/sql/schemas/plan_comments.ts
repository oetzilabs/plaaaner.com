import { relations } from "drizzle-orm";
import { text, timestamp, uuid } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { Entity } from "./entity";
import { plans } from "./plans";
import { schema } from "./utils";
import { plan_comments_mentions } from "./plan_comments_mentions";
import { users } from "./users";

export const plan_comments = schema.table("plan_comments", {
  ...Entity.defaults,
  planId: uuid("plan_id")
    .references(() => plans.id)
    .notNull(),
  userId: uuid("user_id")
    .references(() => users.id)
    .notNull(),
  comment: text("comment").notNull(),
});

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
    id: z.string().uuid(),
  });
