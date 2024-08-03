import { relations } from "drizzle-orm";
import { text, uuid, varchar } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { prefixed_cuid2 } from "../../../custom_cuid2";
import { commonTable, Entity } from "./entity";
import { tickets } from "./tickets";
import { users } from "./users";
import { schema } from "./utils";

export const ticketPaymentType = schema.enum("ticketPaymentType", ["FREE", "PAID"]);

export const ticket_types = commonTable(
  "ticket_types",
  {
    name: text("name").notNull(),
    description: text("description"),
    owner_id: varchar("owner").references(() => users.id, { onDelete: "cascade" }),
    payment_type: ticketPaymentType("payment_type").default("FREE").notNull(),
  },
  "ticket_type",
);

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
    id: prefixed_cuid2,
  });
