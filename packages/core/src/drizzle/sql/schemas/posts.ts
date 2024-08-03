import { relations } from "drizzle-orm";
import { json, text, timestamp, uuid, varchar } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { prefixed_cuid2 } from "../../../custom_cuid2";
import { commonTable, Entity } from "./entity";
import { post_comment_user_mention_notifications } from "./notifications/post/comment_user_mention";
import { post_comments } from "./post_comments";
import { post_comments_mentions } from "./post_comments_mentions";
import { users } from "./users";
import { schema } from "./utils";
import { workspaces_posts } from "./workspaces_posts";

export const postStatus = schema.enum("post_status", ["published", "draft", "hidden"]);

export const posts = commonTable(
  "posts",
  {
    content: text("content").notNull(),
    owner_id: varchar("owner")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    status: postStatus("status").notNull().default("published"),
    location: json("location").$type<{
      zipCode: string;
      city: string;
    }>(),
  },
  "post",
);

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

export const PostCreateSchema = createInsertSchema(posts)
  .omit({ owner_id: true })
  .merge(
    z.object({
      location: z.object({ zipCode: z.string(), city: z.string() }).nullable().optional(),
    }),
  );
export const PostUpdateSchema = PostCreateSchema.partial()
  .omit({ createdAt: true, updatedAt: true })
  .extend({
    id: prefixed_cuid2,
    location: z.object({ zipCode: z.string(), city: z.string() }).nullable().optional(),
  });
