import { text, timestamp, uuid } from "drizzle-orm/pg-core";
import { Entity } from "./entity";
import { schema } from "./utils";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";
import { users } from "./users";
import { post_comments } from "./post_comments";
import { post_comments_mentions } from "./post_comments_mentions";
import { post_comment_user_mention_notifications } from "./notifications/post/comment_user_mention";
import { workspaces_posts } from "./workspaces_posts";

export const postStatus = schema.enum("post_status", ["published", "draft", "hidden"]);

export const posts = schema.table("posts", {
  ...Entity.defaults,
  content: text("content").notNull(),
  owner_id: uuid("owner")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  status: postStatus("status").notNull().default("published"),
});

export const post_relation = relations(posts, ({ many, one }) => ({
  owner: one(users, {
    fields: [posts.owner_id],
    references: [users.id],
  }),
  workpaces: many(workspaces_posts),
  comments: many(post_comments),
  comments_mentions: many(post_comments_mentions),
  comment_user_mentions_notifications: many(post_comment_user_mention_notifications),
}));

export type PostSelect = typeof posts.$inferSelect;
export type PostInsert = typeof posts.$inferInsert;

export const PostCreateSchema = createInsertSchema(posts).omit({ owner_id: true });
export const PostUpdateSchema = PostCreateSchema.partial().omit({ createdAt: true, updatedAt: true }).extend({
  id: z.string().uuid(),
});
