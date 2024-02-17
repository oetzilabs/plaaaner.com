import { uuid, timestamp } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

export * as Entity from "./entity";

export const defaults = {
  id: uuid("id").primaryKey().defaultRandom(),
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
};
