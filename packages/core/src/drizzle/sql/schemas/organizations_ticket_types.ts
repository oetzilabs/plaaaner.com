import { relations } from "drizzle-orm";
import { uuid, varchar } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { prefixed_cuid2 } from "../../../custom_cuid2";
import { commonTable, Entity } from "./entity";
import { organizations } from "./organization";
import { ticket_types } from "./ticket_types";
import { schema } from "./utils";

export const organizations_ticket_types = commonTable(
  "organizations_ticket_types",
  {
    organization_id: varchar("organization_id")
      .references(() => organizations.id, { onDelete: "cascade" })
      .notNull(),
    ticket_type_id: varchar("ticket_type_id")
      .references(() => ticket_types.id, { onDelete: "cascade" })
      .notNull(),
  },
  "org_ticket_type",
);

export const organizations_ticket_types_relation = relations(organizations_ticket_types, ({ many, one }) => ({
  organization: one(organizations, {
    fields: [organizations_ticket_types.organization_id],
    references: [organizations.id],
  }),
  ticket_type: one(ticket_types, {
    fields: [organizations_ticket_types.ticket_type_id],
    references: [ticket_types.id],
  }),
}));

export type OrganizationTicketTypeSelect = typeof organizations_ticket_types.$inferSelect;
export type OrganizationTicketTypeInsert = typeof organizations_ticket_types.$inferInsert;

export const OrganizationTicketTypeCreateSchema = createInsertSchema(organizations_ticket_types);
export const OrganizationTicketTypeUpdateSchema = OrganizationTicketTypeCreateSchema.partial()
  .omit({ createdAt: true, updatedAt: true })
  .extend({
    id: prefixed_cuid2,
  });
