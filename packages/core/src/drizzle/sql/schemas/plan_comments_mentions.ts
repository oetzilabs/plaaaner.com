import { relations } from "drizzle-orm";
import { primaryKey, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { Entity } from "./entity";
import { plans } from "./plans";
import { schema } from "./utils";
import { users } from "./users";
import { plan_comments } from "./plan_comments";

export const plan_comments_mentions = schema.table(
  "plan_comments_mentions",
  {
    planId: uuid("plan_id")
      .references(() => plans.id)
      .notNull(),
    commentId: uuid("comment_id")
      .references(() => plan_comments.id)
      .notNull(),
    userId: uuid("user_id")
      .references(() => users.id)
      .notNull(),
    createdAt: timestamp("created_at", {
      withTimezone: true,
      mode: "date",
    })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", {
      withTimezone: true,
      mode: "date",
    }),
    deletedAt: timestamp("deleted_at", {
      withTimezone: true,
      mode: "date",
    }),
  },
  (table) => {
    return {
      pk: primaryKey({ columns: [table.userId, table.planId, table.commentId] }),
    };
  }
);

export const plan_comments_mentions_relation = relations(plan_comments_mentions, ({ many, one }) => ({
  plan: one(plans, {
    fields: [plan_comments_mentions.planId],
    references: [plans.id],
  }),
  comment: one(plan_comments, {
    fields: [plan_comments_mentions.planId],
    references: [plan_comments.id],
  }),
  user: one(users, {
    fields: [plan_comments_mentions.userId],
    references: [users.id],
  }),
}));
