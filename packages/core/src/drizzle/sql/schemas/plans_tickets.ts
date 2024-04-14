import { primaryKey, timestamp, uuid } from "drizzle-orm/pg-core";
import { schema } from "./utils";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { tickets } from "./tickets";
import { plans } from "./plans";
import { relations } from "drizzle-orm";

export const plan_tickets = schema.table(
  "plan_tickets",
  {
    ticket_id: uuid("ticket_id")
      .notNull()
      .references(() => tickets.id),
    plan_id: uuid("plan_id")
      .notNull()
      .references(() => plans.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at", {
      withTimezone: true,
      mode: "date",
    })
      .notNull()
      .defaultNow(),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.ticket_id, table.plan_id] }),
  })
);

export const plan_tickets_relation = relations(plan_tickets, ({ one }) => ({
  ticket: one(tickets, {
    fields: [plan_tickets.ticket_id],
    references: [tickets.id],
  }),
  plan: one(plans, {
    fields: [plan_tickets.plan_id],
    references: [plans.id],
  }),
}));

export type PlanTicketsSelect = typeof plan_tickets.$inferSelect;
export type PlanTicketsInsert = typeof plan_tickets.$inferInsert;
export const PlanTicketsUpdate = createInsertSchema(plan_tickets)
  .partial()
  .omit({ createdAt: true, updatedAt: true })
  .extend({
    id: z.string().uuid(),
  });
