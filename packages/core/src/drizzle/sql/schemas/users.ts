import { relations } from "drizzle-orm";
import { text, timestamp, uuid } from "drizzle-orm/pg-core";
import { Entity } from "./entity";
import { users_workspaces } from "./users_workspaces";
import { schema } from "./utils";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = schema.table("users", {
  ...Entity.defaults,
  name: text("name").notNull(),
  email: text("email").notNull(),
});

export const sessions = schema.table("session", {
  id: text("id").primaryKey(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, {
      onDelete: "cascade",
      onUpdate: "no action",
    }),
  expiresAt: timestamp("expires_at", {
    withTimezone: true,
    mode: "date",
  }).notNull(),
  access_token: text("access_token"),
  workspace_id: uuid("workspace_id"),
});

export const userRelation = relations(users, ({ many }) => ({
  sessions: many(sessions),
  workspaces: many(users_workspaces),
}));

export type UserSelect = typeof users.$inferSelect;
export type UserInsert = typeof users.$inferInsert;
export const UserUpdateSchema = createInsertSchema(users)
  .partial()
  .omit({ createdAt: true, updatedAt: true })
  .extend({ id: z.string().uuid() });
