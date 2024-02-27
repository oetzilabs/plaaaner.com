import { and, eq, isNull, sql } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { db } from "../drizzle/sql";
import {
  TicketCreateSchema,
  TicketTypeCreateSchema,
  TicketUpdateSchema,
  ticket_types,
  tickets,
} from "../drizzle/sql/schema";

export * as TicketTypes from "./ticket_types";

export const DEFAULT_TICKET_TYPES: Parameters<typeof create>[0] = [
  { name: "default-ticket-for-all-plans", description: "This is the default ticket type, made by our system." },
  { name: "FREE", description: "This ticket will be free." },
  { name: "FREE:VIP", description: "This ticket will be free for VIPs." },
  { name: "PAID:REGULAR", description: "This ticket will be paid for regulars." },
  { name: "PAID:VIP", description: "This ticket will be paid for VIPs." },
] as const;

export const create = z
  .function(z.tuple([TicketTypeCreateSchema.array(), z.string().uuid().nullable()]))
  .implement(async (ticket_types_to_create, user_id) => {
    const names = ticket_types_to_create.map((tt) => tt.name);
    const existing = await db.query.ticket_types.findMany({
      where(fields, operators) {
        return operators.inArray(fields.name, names);
      },
    });

    const missing_new_tickets = ticket_types_to_create.filter((tt) => !existing.some((tt2) => tt2.name === tt.name));
    if (missing_new_tickets.length === 0) {
      return [];
    }

    const new_ticket_types = await db
      .insert(ticket_types)
      .values(missing_new_tickets.map((tt) => ({ ...tt, owner_id: user_id })))
      .returning();

    return new_ticket_types;
  });

export const countAll = z.function(z.tuple([])).implement(async () => {
  const [x] = await db
    .select({
      count: sql`COUNT(${ticket_types.id})`,
    })
    .from(ticket_types);
  return x.count;
});

export const findById = z.function(z.tuple([z.string()])).implement(async (input) => {
  return db.query.ticket_types.findFirst({
    where: (ticket_types, operations) => operations.eq(ticket_types.id, input),
    with: {
      owner: true,
    },
  });
});

export const findByName = z.function(z.tuple([z.string()])).implement(async (input) => {
  return db.query.ticket_types.findFirst({
    where: (ticket_types, operations) => operations.eq(ticket_types.name, input),
    with: {},
  });
});

export const allNonDeleted = z.function(z.tuple([])).implement(async () => {
  return db.query.ticket_types.findMany({
    with: {},
    where(fields, operations) {
      return operations.isNull(fields.deletedAt);
    },
  });
});

export const all = z.function(z.tuple([])).implement(async () => {
  return db.query.ticket_types.findMany({
    with: {},
  });
});

export const update = z
  .function(
    z.tuple([
      createInsertSchema(ticket_types)
        .partial()
        .omit({ createdAt: true, updatedAt: true })
        .merge(z.object({ id: z.string().uuid() })),
    ])
  )
  .implement(async (input) => {
    const [updatedOrganization] = await db
      .update(ticket_types)
      .set({ ...input, updatedAt: new Date() })
      .where(eq(ticket_types.id, input.id))
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
      .update(ticket_types)
      .set({ owner_id: user_id })
      .where(eq(ticket_types.id, organization_id))
      .returning();
    return updated;
  });

export const findByUserId = z.function(z.tuple([z.string().uuid()])).implement(async (user_id) => {
  const ws = await db.query.ticket_types.findFirst({
    where: (ticket_types, operations) =>
      and(operations.eq(ticket_types.owner_id, user_id), isNull(ticket_types.deletedAt)),
    orderBy(fields, operators) {
      return operators.desc(fields.createdAt);
    },
  });
  return ws;
});

export const lastCreatedByUser = z.function(z.tuple([z.string().uuid()])).implement(async (user_id) => {
  const ws = await db.query.ticket_types.findFirst({
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
  const et = await db.query.ticket_types.findFirst({
    where(fields, operators) {
      return operators.eq(fields.name, t);
    },
  });
  return et;
});

export const getDefaultTypeId = z.function(z.tuple([])).implement(async () => {
  const et = await db.query.ticket_types.findFirst({
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

export const getDefaultFreeTicketType = z.function(z.tuple([])).implement(async () => {
  const et = await db.query.ticket_types.findFirst({
    where(fields, operators) {
      return operators.eq(fields.name, DEFAULT_TICKET_TYPES[0].name);
    },
  });
  if (!et) {
    throw new Error("DEFAULT TICKET IS NOT SEEDED!");
  }
  return et;
});

export const getAllTypes = z.function(z.tuple([])).implement(async () => {
  const all_ticket_types = await db.query.ticket_types.findMany();
  return all_ticket_types;
});

export const getDefaultCount = z.function(z.tuple([])).implement(async () => {
  return DEFAULT_TICKET_TYPES.length;
});

export const safeParseCreate = TicketCreateSchema.safeParse;
export const safeParseUpdate = TicketUpdateSchema.safeParse;

export type Frontend = NonNullable<Awaited<ReturnType<typeof findById>>>;
