import { relations } from "drizzle-orm";
import { text, uuid } from "drizzle-orm/pg-core";
import { schema } from "./utils";
import { Entity } from "./entity";
import { users } from "./users";

export const websockets = schema.table("websockets", {
  ...Entity.defaults,
  userId: uuid("user_id").references(() => users.id, { onDelete: "cascade" }),
  connectionId: text("connection_id").notNull(),
});

export type WebsocketsSelect = typeof websockets.$inferSelect;
export type WebsocketsInsert = typeof websockets.$inferInsert;

export const websocketsRelation = relations(websockets, ({ one, many }) => ({
  user: one(users, {
    fields: [websockets.userId],
    references: [users.id],
  }),
}));
