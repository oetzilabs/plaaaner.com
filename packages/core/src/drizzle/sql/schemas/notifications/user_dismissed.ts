import { relations } from "drizzle-orm";
import { primaryKey, timestamp, varchar } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { prefixed_cuid2 } from "../../../../custom_cuid2";
import { users } from "../users";
import { schema } from "../utils";
import { organizations_notifications } from "./organization";
import { system_notifications } from "./system";
import { workspaces_notifications } from "./workspace";

export const user_dismissed_system_notifications = schema.table(
  "user_dismissed_system_notifications",
  {
    notificationId: varchar("notification_id")
      .notNull()
      .references(() => system_notifications.id, { onDelete: "cascade" }),
    userId: varchar("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    dismissedAt: timestamp("dismissed_at", {
      withTimezone: true,
      mode: "date",
    }),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.userId, table.notificationId] }),
  }),
);

export const user_dismissed_system_notificationsRelation = relations(
  user_dismissed_system_notifications,
  ({ one }) => ({
    systemNotification: one(system_notifications, {
      fields: [user_dismissed_system_notifications.notificationId],
      references: [system_notifications.id],
    }),
    user: one(users, {
      fields: [user_dismissed_system_notifications.userId],
      references: [users.id],
    }),
  }),
);

export type UserDismissedSystemNotificationsSelect = typeof user_dismissed_system_notifications.$inferSelect;
export type UserDismissedSystemNotificationsInsert = typeof user_dismissed_system_notifications.$inferInsert;

export const UserDismissedSystemNotificationCreateSchema = createInsertSchema(user_dismissed_system_notifications);
export const UserDismissedSystemNotificationUpdateSchema = UserDismissedSystemNotificationCreateSchema.partial().extend(
  {
    id: prefixed_cuid2,
  },
);

export const user_dismissed_workspace_notifications = schema.table(
  "user_dismissed_workspace_notifications",
  {
    notificationId: varchar("notification_id")
      .notNull()
      .references(() => workspaces_notifications.id, { onDelete: "cascade" }),
    userId: varchar("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    dismissedAt: timestamp("dismissed_at", {
      withTimezone: true,
      mode: "date",
    }),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.userId, table.notificationId] }),
  }),
);

export const user_dismissed_notificationsRelation = relations(user_dismissed_workspace_notifications, ({ one }) => ({
  workspaceNotification: one(workspaces_notifications, {
    fields: [user_dismissed_workspace_notifications.notificationId],
    references: [workspaces_notifications.id],
  }),
  user: one(users, {
    fields: [user_dismissed_workspace_notifications.userId],
    references: [users.id],
  }),
}));

export type UserDismissedWorkspaceNotificationsSelect = typeof user_dismissed_workspace_notifications.$inferSelect;
export type UserDismissedWorkspaceNotificationsInsert = typeof user_dismissed_workspace_notifications.$inferInsert;

export const UserDismissedWorkspaceNotificationCreateSchema = createInsertSchema(
  user_dismissed_workspace_notifications,
);
export const UserDismissedWorkspaceNotificationUpdateSchema =
  UserDismissedWorkspaceNotificationCreateSchema.partial().extend({
    id: prefixed_cuid2,
  });

export const user_dismissed_organization_notifications = schema.table(
  "user_dismissed_organization_notifications",
  {
    notificationId: varchar("notification_id")
      .notNull()
      .references(() => organizations_notifications.id, { onDelete: "cascade" }),
    userId: varchar("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    dismissedAt: timestamp("dismissed_at", {
      withTimezone: true,
      mode: "date",
    }),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.userId, table.notificationId] }),
  }),
);

export const user_dismissed_organization_notificationsRelation = relations(
  user_dismissed_organization_notifications,
  ({ one }) => ({
    organizationNotification: one(organizations_notifications, {
      fields: [user_dismissed_organization_notifications.notificationId],
      references: [organizations_notifications.id],
    }),
    user: one(users, {
      fields: [user_dismissed_organization_notifications.userId],
      references: [users.id],
    }),
  }),
);

export type UserDismissedOrganizationNotificationsSelect =
  typeof user_dismissed_organization_notifications.$inferSelect;
export type UserDismissedOrganizationNotificationsInsert =
  typeof user_dismissed_organization_notifications.$inferInsert;

export const UserDismissedOrganizationNotificationCreateSchema = createInsertSchema(
  user_dismissed_organization_notifications,
);
export const UserDismissedOrganizationNotificationUpdateSchema =
  UserDismissedOrganizationNotificationCreateSchema.partial().extend({
    id: prefixed_cuid2,
  });
