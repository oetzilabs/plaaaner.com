import { relations } from "drizzle-orm";
import { uuid } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { Entity } from "./entity";
import { events } from "./events";
import { organizations } from "./organization";
import { schema } from "./utils";

export const organizations_events = schema.table("organizations_events", {
  ...Entity.defaults,
  organization_id: uuid("organization_id")
    .references(() => organizations.id)
    .notNull(),
  event_id: uuid("event_id")
    .references(() => events.id)
    .notNull(),
});

export const organizations_events_relation = relations(organizations_events, ({ many, one }) => ({
  organization: one(organizations, {
    fields: [organizations_events.organization_id],
    references: [organizations.id],
  }),
  event: one(events, {
    fields: [organizations_events.event_id],
    references: [events.id],
  }),
}));

export type OrganizationEventSelect = typeof organizations_events.$inferSelect;
export type OrganizationEventInsert = typeof organizations_events.$inferInsert;

export const OrganizationEventCreateSchema = createInsertSchema(organizations_events);
export const OrganizationEventUpdateSchema = OrganizationEventCreateSchema.partial()
  .omit({ createdAt: true, updatedAt: true })
  .extend({
    id: z.string().uuid(),
  });
