import { relations } from "drizzle-orm";
import { primaryKey, timestamp, uuid } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { plan_comments } from "../../plan_comments";
import { posts } from "../../posts";
import { users } from "../../users";
import { schema } from "../../utils";

export const post_comment_user_mention_notifications = schema.table(
  "post_comment_mention_notifications",
  {
    createdAt: timestamp("created_at", {
      withTimezone: true,
      mode: "date",
    })
      .notNull()
      .defaultNow(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id),
    commentId: uuid("comment_id")
      .notNull()
      .references(() => plan_comments.id),
    postId: uuid("post_id")
      .notNull()
      .references(() => posts.id),
  },
  (table) => {
    return {
      pk: primaryKey({ columns: [table.userId, table.postId, table.commentId] }),
    };
  }
);

export const post_comment_mention_notifications_relations = relations(
  post_comment_user_mention_notifications,
  ({ one }) => ({
    user: one(users, {
      fields: [post_comment_user_mention_notifications.userId],
      references: [users.id],
    }),
    postComment: one(users, {
      fields: [post_comment_user_mention_notifications.commentId],
      references: [users.id],
    }),
    post: one(posts, {
      fields: [post_comment_user_mention_notifications.postId],
      references: [posts.id],
    }),
  })
);

export const PostCommentMentionNotificationsCreateSchema = createInsertSchema(post_comment_user_mention_notifications);
export const PostCommentMentionNotificationsUpdateSchema = PostCommentMentionNotificationsCreateSchema.partial()
  .omit({ createdAt: true, updatedAt: true })
  .extend({
    id: z.string().uuid(),
  });
