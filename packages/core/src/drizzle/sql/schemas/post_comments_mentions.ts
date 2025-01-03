import { relations } from "drizzle-orm";
import { primaryKey, timestamp, uuid, varchar } from "drizzle-orm/pg-core";
import { plan_comments } from "./plan_comments";
import { posts } from "./posts";
import { users } from "./users";
import { schema } from "./utils";

export const post_comments_mentions = schema.table(
  "post_comments_mentions",
  {
    postId: varchar("post_id")
      .references(() => posts.id, { onDelete: "cascade" })
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
      pk: primaryKey({ columns: [table.userId, table.postId, table.commentId] }),
    };
  },
);

export const post_comments_mentions_relation = relations(post_comments_mentions, ({ many, one }) => ({
  post: one(posts, {
    fields: [post_comments_mentions.postId],
    references: [posts.id],
  }),
  comment: one(plan_comments, {
    fields: [post_comments_mentions.commentId],
    references: [plan_comments.id],
  }),
  user: one(users, {
    fields: [post_comments_mentions.userId],
    references: [users.id],
  }),
}));
