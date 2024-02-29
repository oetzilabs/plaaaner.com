import { text, uuid } from "drizzle-orm/pg-core";
import { Entity } from "./entity";
import { schema } from "./utils";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";
import { events } from "./events";
import { users } from "./users";

export const event_types = schema.table("event_types", {
  ...Entity.defaults,
  name: text("name").notNull(),
  description: text("description"),
  owner_id: uuid("owner").references(() => users.id),
});

export const event_types_relation = relations(event_types, ({ many, one }) => ({
  events: many(events),
  owner: one(users, {
    fields: [event_types.owner_id],
    references: [users.id],
  }),
}));

export type EventTypeSelect = typeof event_types.$inferSelect;
export type EventTypeInsert = typeof event_types.$inferInsert;

export const EventTypeCreateSchema = createInsertSchema(event_types);
export const EventTypeUpdateSchema = EventTypeCreateSchema.partial().omit({ createdAt: true, updatedAt: true }).extend({
  id: z.string().uuid(),
});
