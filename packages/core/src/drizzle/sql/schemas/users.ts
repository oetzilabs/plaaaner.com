import { relations } from "drizzle-orm";
import { text, timestamp, uuid } from "drizzle-orm/pg-core";
import { Entity } from "./entity";
import { users_workspaces } from "./users_workspaces";
import { schema } from "./utils";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { users_organizations } from "./user_organizations";
import { organizations_joins } from "./organizations_joins";
import { plan_comment_user_mention_notifications } from "./notifications/plan/comment_user_mention";

export const users = schema.table("users", {
  ...Entity.defaults,
  name: text("name").notNull(),
  email: text("email").notNull(),
  emailVerifiedAt: timestamp("email_verified_at", {
    withTimezone: true,
    mode: "date",
  }),
});

export const sessions = schema.table("session", {
  id: text("id").primaryKey(),
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
  organization_id: uuid("organization_id"),
});

export const userRelation = relations(users, ({ many }) => ({
  sessions: many(sessions),
  workspaces: many(users_workspaces),
  organizations: many(users_organizations),
  joins: many(organizations_joins),
  notification_comment_mentions: many(plan_comment_user_mention_notifications),
}));

export type UserSelect = typeof users.$inferSelect;
export type UserInsert = typeof users.$inferInsert;
export const UserUpdateSchema = createInsertSchema(users)
  .partial()
  .omit({ createdAt: true, updatedAt: true })
  .extend({ id: z.string().uuid() });

export const sessionRelation = relations(sessions, ({ one }) => ({
  user: one(users, {
    fields: [sessions.userId],
    references: [users.id],
  }),
}));

export type SessionSelect = typeof sessions.$inferSelect;
export type SessionInsert = typeof sessions.$inferInsert;
export const SessionUpdateSchema = createInsertSchema(sessions)
  .partial()
  .omit({ createdAt: true, updatedAt: true })
  .extend({ id: z.string().uuid() });
