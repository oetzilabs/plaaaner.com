import { relations } from "drizzle-orm";
import { primaryKey, timestamp, uuid } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { plans } from "./plans";
import { workspaces } from "./workspaces";
import { schema } from "./utils";

export const workspaces_plans = schema.table("workspaces_plans", {
  workspace_id: uuid("workspace_id")
    .references(() => workspaces.id)
    .notNull(),
  plan_id: uuid("plan_id")
    .references(() => plans.id)
    .notNull(),
  createdAt: timestamp("created_at", {
    withTimezone: true,
    mode: "date",
  })
    .notNull()
    .defaultNow(),
}, (table) => ({
  pk: primaryKey({ columns: [table.workspace_id, table.plan_id] })
}));

export const workspaces_plans_relation = relations(workspaces_plans, ({ many, one }) => ({
  workspace: one(workspaces, {
    fields: [workspaces_plans.workspace_id],
    references: [workspaces.id],
  }),
  plan: one(plans, {
    fields: [workspaces_plans.plan_id],
    references: [plans.id],
  }),
}));

export type WorkspacePlanSelect = typeof workspaces_plans.$inferSelect;
export type WorkspacePlanInsert = typeof workspaces_plans.$inferInsert;

export const WorkspacePlanCreateSchema = createInsertSchema(workspaces_plans);
export const WorkspacePlanUpdateSchema = WorkspacePlanCreateSchema.partial()
  .omit({ createdAt: true, updatedAt: true })
  .extend({
    id: z.string().uuid(),
  });
