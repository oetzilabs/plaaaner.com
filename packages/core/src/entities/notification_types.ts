import { and, eq, isNull, sql } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { db } from "../drizzle/sql";
import {
  NotificationCreateSchema,
  NotificationTypeCreateSchema,
  NotificationUpdateSchema,
  notification_types,
  notifications,
} from "../drizzle/sql/schema";

export * as NotificationTypes from "./notification_types";

export const DEFAULT_TICKET_TYPES: Parameters<typeof create>[0] = [
  { name: "workspace", description: "This notification is for workspaces."},
  { name: "organization", description: "This notification is for organizations."},
] as const;

export const create = z
  .function(z.tuple([NotificationTypeCreateSchema.array(), z.string().uuid().nullable()]))
  .implement(async (notification_types_to_create, user_id) => {
    const names = notification_types_to_create.map((tt) => tt.name);
    const existing = await db.query.notification_types.findMany({
      where(fields, operators) {
        return operators.inArray(fields.name, names);
      },
    });

    const missing_new_notifications = notification_types_to_create.filter((tt) => !existing.some((tt2) => tt2.name === tt.name));
    if (missing_new_notifications.length === 0) {
      return [];
    }

    const new_notification_types = await db
      .insert(notification_types)
      .values(missing_new_notifications.map((tt) => ({ ...tt, owner_id: user_id })))
      .returning();

    return new_notification_types;
  });

export const upsert = z
  .function(z.tuple([NotificationTypeCreateSchema.array(), z.string().uuid().nullable()]))
  .implement(async (notification_types_to_create, user_id) => {
    const updated = [];
    const names = notification_types_to_create.map((tt) => tt.name);
    const existing = await db.query.notification_types.findMany({
      where(fields, operators) {
        return operators.inArray(fields.name, names);
      },
    });

    for await (const e of existing) {
      const to_update = notification_types_to_create.find((tttc) => tttc.name === e.name)!;
      const u = await db.update(notification_types).set(to_update).where(eq(notification_types.name, e.name)).returning();
      updated.push(u);
    }

    const missing_new_notifications = notification_types_to_create.filter((tt) => !existing.some((tt2) => tt2.name === tt.name));
    if (missing_new_notifications.length === 0) {
      return updated;
    }

    const new_notification_types = await db
      .insert(notification_types)
      .values(missing_new_notifications.map((tt) => ({ ...tt, owner_id: user_id })))
      .returning();

    updated.push(...new_notification_types);

    return updated;
  });
export const countAll = z.function(z.tuple([])).implement(async () => {
  const [x] = await db
    .select({
      count: sql`COUNT(${notification_types.id})`,
    })
    .from(notification_types);
  return x.count;
});

export const findById = z.function(z.tuple([z.string()])).implement(async (input) => {
  return db.query.notification_types.findFirst({
    where: (notification_types, operations) => operations.eq(notification_types.id, input),
    with: {
      owner: true,
    },
  });
});

export const findByName = z.function(z.tuple([z.string()])).implement(async (input) => {
  return db.query.notification_types.findFirst({
    where: (notification_types, operations) => operations.eq(notification_types.name, input),
    with: {},
  });
});

export const allNonDeleted = z.function(z.tuple([])).implement(async () => {
  return db.query.notification_types.findMany({
    with: {},
    where(fields, operations) {
      return operations.isNull(fields.deletedAt);
    },
  });
});

export const all = z.function(z.tuple([])).implement(async () => {
  return db.query.notification_types.findMany({
    with: {},
  });
});

export const update = z
  .function(
    z.tuple([
      createInsertSchema(notification_types)
        .partial()
        .omit({ createdAt: true, updatedAt: true })
        .merge(z.object({ id: z.string().uuid() })),
    ]),
  )
  .implement(async (input) => {
    const [updatedOrganization] = await db
      .update(notification_types)
      .set({ ...input, updatedAt: new Date() })
      .where(eq(notification_types.id, input.id))
      .returning();
    return updatedOrganization;
  });

export const markAsDeleted = z.function(z.tuple([z.object({ id: z.string().uuid() })])).implement(async (input) => {
  return update({ id: input.id, deletedAt: new Date() });
});

export const setOwner = z
  .function(z.tuple([z.string().uuid(), z.string().uuid()]))
  .implement(async (organization_id, user_id) => {
    const [updated] = await db
      .update(notification_types)
      .set({ owner_id: user_id })
      .where(eq(notification_types.id, organization_id))
      .returning();
    return updated;
  });

export const findByUserId = z.function(z.tuple([z.string().uuid()])).implement(async (user_id) => {
  const ws = await db.query.notification_types.findFirst({
    where: (notification_types, operations) =>
      and(operations.eq(notification_types.owner_id, user_id), isNull(notification_types.deletedAt)),
    orderBy(fields, operators) {
      return operators.desc(fields.createdAt);
    },
  });
  return ws;
});

export const lastCreatedByUser = z.function(z.tuple([z.string().uuid()])).implement(async (user_id) => {
  const ws = await db.query.notification_types.findFirst({
    where: (fields, operators) => and(operators.eq(fields.owner_id, user_id), operators.isNull(fields.deletedAt)),
    orderBy(fields, operators) {
      return operators.desc(fields.createdAt);
    },
    with: {
      owner: true,
    },
  });
  return ws;
});

export const getTypeId = z.function(z.tuple([z.string()])).implement(async (t) => {
  const et = await db.query.notification_types.findFirst({
    where(fields, operators) {
      return operators.eq(fields.name, t);
    },
  });
  return et;
});

export const getDefaultTypeId = z.function(z.tuple([])).implement(async () => {
  const et = await db.query.notification_types.findFirst({
    where(fields, operators) {
      return operators.eq(fields.name, DEFAULT_TICKET_TYPES[0].name);
    },
    columns: {
      id: true,
    },
  });
  if (!et) {
    throw new Error("DEFAULT TICKET IS NOT SEEDED!");
  }
  return et.id;
});

export const getDefaultFreeNotificationType = z.function(z.tuple([])).implement(async () => {
  const et = await db.query.notification_types.findFirst({
    where(fields, operators) {
      return operators.eq(fields.name, DEFAULT_TICKET_TYPES[1].name);
    },
  });
  if (!et) {
    throw new Error("DEFAULT TICKET IS NOT SEEDED!");
  }
  return et;
});

export const getAllTypes = z.function(z.tuple([])).implement(async () => {
  const all_notification_types = await db.query.notification_types.findMany();
  return all_notification_types;
});

export const getDefaultCount = z.function(z.tuple([])).implement(async () => {
  return DEFAULT_TICKET_TYPES.length;
});

export const safeParseCreate = NotificationCreateSchema.safeParse;
export const safeParseUpdate = NotificationUpdateSchema.safeParse;

export type Frontend = NonNullable<Awaited<ReturnType<typeof findById>>>;

