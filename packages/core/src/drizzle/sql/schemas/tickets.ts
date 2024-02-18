import { text, uuid } from "drizzle-orm/pg-core";
import { Entity } from "./entity";
import { schema } from "./utils";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";
import { users } from "./users";
import { ticket_types } from "./ticket_types";

export const tickets = schema.table("tickets", {
  ...Entity.defaults,
  name: text("name").notNull(),
  ticket_type_id: uuid("ticket_type_id")
    .notNull()
    .references(() => ticket_types.id),
  owner_id: uuid("owner").references(() => users.id),
});

export const tickets_relation = relations(tickets, ({ many, one }) => ({
  ticket_type: one(ticket_types, {
    fields: [tickets.ticket_type_id],
    references: [ticket_types.id],
  }),
  owner: one(users, {
    fields: [tickets.owner_id],
    references: [users.id],
  }),
}));

export type TicketSelect = typeof tickets.$inferSelect;
export type TicketInsert = typeof tickets.$inferInsert;

export const TicketCreateSchema = createInsertSchema(tickets);
export const TicketUpdateSchema = TicketCreateSchema.partial().omit({ createdAt: true, updatedAt: true }).extend({
  id: z.string().uuid(),
});
