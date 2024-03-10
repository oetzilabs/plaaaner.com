import { decimal, integer, pgEnum, text, uuid } from "drizzle-orm/pg-core";
import { Entity } from "./entity";
import { schema } from "./utils";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";
import { users } from "./users";
import { ticket_types } from "./ticket_types";
import { plans } from "./plans";

export const currency = pgEnum("currency", ["FREE", "USD", "EUR", "CHF", "OTHER"]);
export const ticketShape = pgEnum("ticket_shape", ["default", "default-1", "default-2", "custom"]);

export const tickets = schema.table("tickets", {
  ...Entity.defaults,
  name: text("name").notNull(),
  ticket_type_id: uuid("ticket_type_id")
    .notNull()
    .references(() => ticket_types.id),
  owner_id: uuid("owner")
    .notNull()
    .references(() => users.id),
  plan_id: uuid("plan_id")
    .notNull()
    .references(() => plans.id),
  price: decimal("price", { precision: 2 }).notNull(),
  currency: currency("currency").notNull(),
  quantity: integer("quantity").notNull(),
  shape: ticketShape("ticket_shape").notNull(),
});

export const tickets_relation = relations(tickets, ({ many, one }) => ({
  ticket_type: one(ticket_types, {
    fields: [tickets.ticket_type_id],
    references: [ticket_types.id],
  }),
  plan: one(plans, {
    fields: [tickets.plan_id],
    references: [plans.id],
  }),
  owner: one(users, {
    fields: [tickets.owner_id],
    references: [users.id],
  }),
}));

export type TicketSelect = typeof tickets.$inferSelect;
export type TicketInsert = typeof tickets.$inferInsert;

export const TicketCreateSchema = createInsertSchema(tickets).omit({ owner_id: true });
export const TicketUpdateSchema = TicketCreateSchema.partial().omit({ createdAt: true, updatedAt: true }).extend({
  id: z.string().uuid(),
});
