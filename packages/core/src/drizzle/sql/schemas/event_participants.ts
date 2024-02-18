import { uuid } from "drizzle-orm/pg-core";
import { Entity } from "./entity";
import { schema } from "./utils";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { users } from "./users";
import { events } from "./events";
import { relations } from "drizzle-orm";

export const event_participants = schema.table("event_participants", {
  ...Entity.defaults,
  participant_id: uuid("participant_id")
    .notNull()
    .references(() => users.id),
  event_id: uuid("event_id")
    .notNull()
    .references(() => events.id),
});

export const event_participants_relation = relations(event_participants, ({ one }) => ({
  user: one(users, {
    fields: [event_participants.participant_id],
    references: [users.id],
  }),
  workspace: one(events, {
    fields: [event_participants.event_id],
    references: [events.id],
  }),
}));

export type EventParticipantsSelect = typeof event_participants.$inferSelect;
export type EventParticipantsInsert = typeof event_participants.$inferInsert;
export const EventParticipantsUpdate = createInsertSchema(event_participants)
  .partial()
  .omit({ createdAt: true, updatedAt: true })
  .extend({
    id: z.string().uuid(),
  });
