import { relations } from "drizzle-orm";
import { text, uuid } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { Entity } from "./entity";
import { plan_comments_mentions } from "./plan_comments_mentions";
import { posts } from "./posts";
import { users } from "./users";
import { schema } from "./utils";

export const post_comments = schema.table("post_comments", {
  ...Entity.defaults,
  postId: uuid("post_id")
    .references(() => posts.id)
    .notNull(),
  userId: uuid("user_id")
    .references(() => users.id)
    .notNull(),
  comment: text("comment").notNull(),
});

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
    id: z.string().uuid(),
  });
