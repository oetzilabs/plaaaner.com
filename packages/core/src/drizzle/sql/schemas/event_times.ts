import { relations } from "drizzle-orm";
import { timestamp, uuid } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { Entity } from "./entity";
import { events } from "./events";
import { schema } from "./utils";

export const event_times = schema.table("event_times", {
  ...Entity.defaults,
  event_id: uuid("event_id")
    .references(() => events.id)
    .notNull(),
  starts_at: timestamp("starts_at", {
    withTimezone: true,
    mode: "date",
  }).notNull(),
  ends_at: timestamp("ends_at", {
    withTimezone: true,
    mode: "date",
  }).notNull(),
});

export const event_times_relation = relations(event_times, ({ many, one }) => ({
  event: one(events, {
    fields: [event_times.event_id],
    references: [events.id],
  }),
}));

export type EventTimesSelect = typeof event_times.$inferSelect;
export type EventTimesInsert = typeof event_times.$inferInsert;

export const EventTimesCreateSchema = createInsertSchema(event_times);
export const EventTimesUpdateSchema = EventTimesCreateSchema.partial()
  .omit({ createdAt: true, updatedAt: true })
  .extend({
    id: z.string().uuid(),
  });
