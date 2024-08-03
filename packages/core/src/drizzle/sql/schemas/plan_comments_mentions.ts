import { relations } from "drizzle-orm";
import { primaryKey, timestamp, uuid, varchar } from "drizzle-orm/pg-core";
import { plan_comments } from "./plan_comments";
import { plans } from "./plans";
import { users } from "./users";
import { schema } from "./utils";

export const plan_comments_mentions = schema.table(
  "plan_comments_mentions",
  {
    planId: varchar("plan_id")
      .references(() => plans.id, { onDelete: "cascade" })
      .notNull(),
    commentId: varchar("comment_id")
      .references(() => plan_comments.id, { onDelete: "cascade" })
      .notNull(),
    userId: varchar("user_id")
      .references(() => users.id, { onDelete: "cascade" })
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
  },
);

export const plan_comments_mentions_relation = relations(plan_comments_mentions, ({ many, one }) => ({
  plan: one(plans, {
    fields: [plan_comments_mentions.planId],
    references: [plans.id],
  }),
  comment: one(plan_comments, {
    fields: [plan_comments_mentions.commentId],
    references: [plan_comments.id],
  }),
  user: one(users, {
    fields: [plan_comments_mentions.userId],
    references: [users.id],
  }),
}));
