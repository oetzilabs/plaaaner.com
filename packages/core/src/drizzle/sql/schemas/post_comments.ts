import { relations } from "drizzle-orm";
import { text, uuid, varchar } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { prefixed_cuid2 } from "../../../custom_cuid2";
import { commonTable, Entity } from "./entity";
import { plan_comments_mentions } from "./plan_comments_mentions";
import { posts } from "./posts";
import { users } from "./users";
import { schema } from "./utils";

export const post_comments = commonTable(
  "post_comments",
  {
    postId: varchar("post_id")
      .references(() => posts.id, { onDelete: "cascade" })
      .notNull(),
    userId: varchar("user_id")
      .references(() => users.id, { onDelete: "cascade" })
      .notNull(),
    comment: text("comment").notNull(),
  },
  "post_comment",
);

export const post_comments_relation = relations(post_comments, ({ many, one }) => ({
  post: one(posts, {
    fields: [post_comments.postId],
    references: [posts.id],
  }),
  user: one(users, {
    fields: [post_comments.userId],
    references: [users.id],
  }),
  mentions: many(plan_comments_mentions),
}));

export type PostCommentsSelect = typeof post_comments.$inferSelect;
export type PostCommentsInsert = typeof post_comments.$inferInsert;

export const PostCommentsCreateSchema = createInsertSchema(post_comments);
export const PostCommentsUpdateSchema = PostCommentsCreateSchema.partial()
  .omit({ createdAt: true, updatedAt: true })
  .extend({
    id: prefixed_cuid2,
  });
