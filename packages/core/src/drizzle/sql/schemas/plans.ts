import { jsonb, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { Entity } from "./entity";
import { schema } from "./utils";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";
import { users } from "./users";
import { plan_types } from "./plan_types";
import { plan_times } from "./plan_times";
import { plan_comments } from "./plan_comments";
import { plan_comments_mentions } from "./plan_comments_mentions";
import { plan_comment_user_mention_notifications } from "./notifications/plan/comment_user_mention";
import { workspaces_plans } from "./workspaces_plans";
import type { ConcertLocation } from "../../../entities/plans";

export const plansStatus = schema.enum("plans_status", ["published", "draft", "hidden"]);

export const plans = schema.table("plans", {
  ...Entity.defaults,
  name: text("name").notNull(),
  description: text("description"),
  plan_type_id: uuid("plan_type_id").references(() => plan_types.id, { onDelete: "cascade" }),
  owner_id: uuid("owner")
    .notNull()
    .references(() => users.id),
  starts_at: timestamp("starts_at", {
    withTimezone: true,
    mode: "date",
  }).notNull(),
  ends_at: timestamp("ends_at", {
    withTimezone: true,
    mode: "date",
  }).notNull(),
  location: jsonb("location").$type<ConcertLocation>().notNull().default({
    location_type: "other",
    details: "",
  }),
  status: plansStatus("status").notNull().default("published"),
});

export const plans_relation = relations(plans, ({ many, one }) => ({
  plan_type: one(plan_types, {
    fields: [plans.plan_type_id],
    references: [plan_types.id],
  }),
  owner: one(users, {
    fields: [plans.owner_id],
    references: [users.id],
  }),
  workspaces: many(workspaces_plans),
  times: many(plan_times),
  comments: many(plan_comments),
  comments_mentions: many(plan_comments_mentions),
  comment_user_mentions_notifications: many(plan_comment_user_mention_notifications),
}));

export type PlanSelect = typeof plans.$inferSelect;
export type PlanInsert = typeof plans.$inferInsert;

export const PlanCreateSchema = createInsertSchema(plans).omit({ owner_id: true, location: true });
// .merge(z.object({ location: ConcertLocationSchema.optional() }));
export const PlanUpdateSchema = PlanCreateSchema.partial().omit({ createdAt: true, updatedAt: true }).extend({
  id: z.string().uuid(),
});
