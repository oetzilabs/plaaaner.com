import { text, uuid } from "drizzle-orm/pg-core";
import { Entity } from "./entity";
import { schema } from "./utils";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";
import { users } from "./users";
import { event_types } from "./event_types";

export const events = schema.table("events", {
  ...Entity.defaults,
  name: text("name").notNull(),
  description: text("description"),
  event_type_id: uuid("event_type_id").notNull().references(() => event_types.id),
  owner_id: uuid("owner").references(() => users.id),
});

export const events_relation = relations(events, ({ many, one }) => ({
  event_type: one(event_types, {
    fields: [events.event_type_id],
    references: [event_types.id],
  }),
  owner: one(users, {
    fields: [events.owner_id],
    references: [users.id],
  }),
}));

export type EventSelect = typeof events.$inferSelect;
export type EventInsert = typeof events.$inferInsert;

export const EventCreateSchema = createInsertSchema(events);
export const EventUpdateSchema = EventCreateSchema.partial().omit({ createdAt: true, updatedAt: true }).extend({
  id: z.string().uuid(),
});

