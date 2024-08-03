import { relations } from "drizzle-orm";
import { text, uuid, varchar } from "drizzle-orm/pg-core";
import { commonTable, Entity } from "./entity";
import { users } from "./users";
import { schema } from "./utils";

export const websockets = commonTable(
  "websockets",
  {
    userId: varchar("user_id").references(() => users.id, { onDelete: "cascade" }),
    connectionId: text("connection_id").notNull(),
  },
  "websocket",
);

export type WebsocketsSelect = typeof websockets.$inferSelect;
export type WebsocketsInsert = typeof websockets.$inferInsert;

export const websocketsRelation = relations(websockets, ({ one, many }) => ({
  user: one(users, {
    fields: [websockets.userId],
    references: [users.id],
  }),
}));
