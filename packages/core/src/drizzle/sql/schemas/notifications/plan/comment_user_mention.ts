import { relations } from "drizzle-orm";
import { primaryKey, timestamp, uuid, varchar } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { prefixed_cuid2 } from "../../../../../custom_cuid2";
import { plan_comments } from "../../plan_comments";
import { plans } from "../../plans";
import { users } from "../../users";
import { schema } from "../../utils";

export const plan_comment_user_mention_notifications = schema.table(
  "plan_comment_mention_notifications",
  {
    createdAt: timestamp("created_at", {
      withTimezone: true,
      mode: "date",
    })
      .notNull()
      .defaultNow(),
    userId: varchar("user_id")
      .notNull()
      .references(() => users.id),
    commentId: varchar("comment_id")
      .notNull()
      .references(() => plan_comments.id),
    planId: varchar("plan_id")
      .notNull()
      .references(() => plans.id),
  },
  (table) => {
    return {
      pk: primaryKey({ columns: [table.userId, table.planId, table.commentId] }),
    };
  },
);

export const plan_comment_mention_notifications_relations = relations(
  plan_comment_user_mention_notifications,
  ({ one }) => ({
    user: one(users, {
      fields: [plan_comment_user_mention_notifications.userId],
      references: [users.id],
    }),
    planComment: one(users, {
      fields: [plan_comment_user_mention_notifications.userId],
      references: [users.id],
    }),
    plan: one(plans, {
      fields: [plan_comment_user_mention_notifications.planId],
      references: [plans.id],
    }),
  }),
);

export const PlanCommentMentionNotificationsCreateSchema = createInsertSchema(plan_comment_user_mention_notifications);
export const PlanCommentMentionNotificationsUpdateSchema = PlanCommentMentionNotificationsCreateSchema.partial()
  .omit({ createdAt: true })
  .extend({
    id: prefixed_cuid2,
  });
