import { relations } from "drizzle-orm";
import { decimal, integer, text, uuid, varchar } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { prefixed_cuid2 } from "../../../custom_cuid2";
import { commonTable, Entity } from "./entity";
import { plans } from "./plans";
import { ticket_types } from "./ticket_types";
import { users } from "./users";
import { schema } from "./utils";

export const currency = schema.enum("currency", ["FREE", "USD", "EUR", "CHF", "OTHER"]);
export const ticketShape = schema.enum("ticket_shape", ["default", "default-1", "default-2", "custom"]);

export const tickets = commonTable(
  "tickets",
  {
    name: text("name").notNull(),
    ticket_type_id: varchar("ticket_type_id")
      .notNull()
      .references(() => ticket_types.id),
    owner_id: varchar("owner")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    plan_id: varchar("plan_id")
      .notNull()
      .references(() => plans.id, { onDelete: "cascade" }),
    price: decimal("price", { precision: 2 }).notNull(),
    currency: currency("currency").notNull(),
    quantity: integer("quantity").notNull(),
    shape: ticketShape("ticket_shape").notNull(),
  },
  "ticket",
);

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
  id: prefixed_cuid2,
});
