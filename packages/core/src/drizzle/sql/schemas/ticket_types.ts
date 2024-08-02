import { text, uuid } from "drizzle-orm/pg-core";
import { Entity } from "./entity";
import { schema } from "./utils";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";
import { users } from "./users";
import { tickets } from "./tickets";

export const ticketPaymentType = schema.enum("ticketPaymentType", ["FREE", "PAID"]);

export const ticket_types = schema.table("ticket_types", {
  ...Entity.defaults,
  name: text("name").notNull(),
  description: text("description"),
  owner_id: uuid("owner").references(() => users.id, { onDelete: "cascade" }),
  payment_type: ticketPaymentType("payment_type").default("FREE").notNull(),
});

export const ticket_types_relation = relations(ticket_types, ({ many, one }) => ({
  tickets: many(tickets),
  owner: one(users, {
    fields: [ticket_types.owner_id],
    references: [users.id],
  }),
}));

export type TicketTypeSelect = typeof ticket_types.$inferSelect;
export type TicketTypeInsert = typeof ticket_types.$inferInsert;

export const TicketTypeCreateSchema = createInsertSchema(ticket_types).omit({ owner_id: true });
export const TicketTypeUpdateSchema = TicketTypeCreateSchema.partial()
  .omit({ createdAt: true, updatedAt: true })
  .extend({
    id: z.string().uuid(),
  });
