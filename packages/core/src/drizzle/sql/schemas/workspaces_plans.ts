import { relations } from "drizzle-orm";
import { primaryKey, timestamp, uuid, varchar } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { prefixed_cuid2 } from "../../../custom_cuid2";
import { plans } from "./plans";
import { schema } from "./utils";
import { workspaces } from "./workspaces";

export const workspaces_plans = schema.table(
  "workspaces_plans",
  {
    workspace_id: varchar("workspace_id")
      .references(() => workspaces.id, { onDelete: "cascade" })
      .notNull(),
    plan_id: varchar("plan_id")
      .references(() => plans.id, { onDelete: "cascade" })
      .notNull(),

    createdAt: timestamp("created_at", {
      withTimezone: true,
      mode: "date",
    })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", {
      withTimezone: true,
      mode: "date",
    }),
    deletedAt: timestamp("deleted_at", {
      withTimezone: true,
      mode: "date",
    }),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.workspace_id, table.plan_id] }),
  }),
);

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
export const WorkspacePlanUpdateSchema = WorkspacePlanCreateSchema.partial().omit({ createdAt: true }).extend({
  id: prefixed_cuid2,
});
