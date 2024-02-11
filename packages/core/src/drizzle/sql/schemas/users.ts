import { sqliteTable, text } from "drizzle-orm/sqlite-core";
import { Entity } from "./entity";
import { relations } from "drizzle-orm";

export const users = sqliteTable("users", {
  ...Entity.defaults,
  name: text("name").notNull(),
  email: text("email").notNull(),
});

export const userRelation = relations(users, ({ many }) => ({}));

export type UserSelect = typeof users.$inferSelect;
export type UserInsert = typeof users.$inferInsert;
