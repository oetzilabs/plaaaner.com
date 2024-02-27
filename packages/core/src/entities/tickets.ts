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

export * as Tickets from "./tickets";

export const create = z
  .function(z.tuple([TicketCreateSchema, z.string().uuid()]))
  .implement(async (userInput, userId) => {
    const [x] = await db
      .insert(tickets)
      .values({ ...userInput, owner_id: userId })
      .returning();

    return x;
  });

export const countAll = z.function(z.tuple([])).implement(async () => {
  const [x] = await db
    .select({
      count: sql`COUNT(${tickets.id})`,
    })
    .from(tickets);
  return x.count;
});

export const findById = z.function(z.tuple([z.string()])).implement(async (input) => {
  return db.query.tickets.findFirst({
    where: (tickets, operations) => operations.eq(tickets.id, input),
    with: {
      owner: true,
    },
  });
});

export const findByName = z.function(z.tuple([z.string()])).implement(async (input) => {
  return db.query.tickets.findFirst({
    where: (tickets, operations) => operations.eq(tickets.name, input),
    with: {},
  });
});

export const allNonDeleted = z.function(z.tuple([])).implement(async () => {
  return db.query.tickets.findMany({
    with: {},
    where(fields, operations) {
      return operations.isNull(fields.deletedAt);
    },
  });
});

export const all = z.function(z.tuple([])).implement(async () => {
  return db.query.tickets.findMany({
    with: {},
  });
});

export const update = z
  .function(
    z.tuple([
      createInsertSchema(tickets)
        .partial()
        .omit({ createdAt: true, updatedAt: true })
        .merge(z.object({ id: z.string().uuid() })),
    ])
  )
  .implement(async (input) => {
    const [updatedOrganization] = await db
      .update(tickets)
      .set({ ...input, updatedAt: new Date() })
      .where(eq(tickets.id, input.id))
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
      .update(tickets)
      .set({ owner_id: user_id })
      .where(eq(tickets.id, organization_id))
      .returning();
    return updated;
  });

export const findByUserId = z.function(z.tuple([z.string().uuid()])).implement(async (user_id) => {
  const ws = await db.query.tickets.findFirst({
    where: (tickets, operations) => and(operations.eq(tickets.owner_id, user_id), isNull(tickets.deletedAt)),
    orderBy(fields, operators) {
      return operators.desc(fields.createdAt);
    },
  });
  return ws;
});

export const lastCreatedByUser = z.function(z.tuple([z.string().uuid()])).implement(async (user_id) => {
  const ws = await db.query.tickets.findFirst({
    where: (fields, operators) => and(operators.eq(fields.owner_id, user_id), operators.isNull(fields.deletedAt)),
    orderBy(fields, operators) {
      return operators.desc(fields.createdAt);
    },
    with: {
      owner: true,
      ticket_type: true,
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
      return operators.eq(fields.name, "default-ticket-for-all-plans");
    },
    columns: {
      id: true,
    },
  });
  // TODO!: I have to provide a default ticket type, for the case that the requested ticket_type does not exist!
  if (!et) {
    throw new Error("DEFAULT TICKET IS NOT SEEDED!");
  }
  return et.id;
});

export const getAllTypes = z.function(z.tuple([])).implement(async () => {
  const all_ticket_types = await db.query.ticket_types.findMany({});
  return all_ticket_types;
});

export const safeParseCreate = TicketCreateSchema.safeParse;
export const safeParseUpdate = TicketUpdateSchema.safeParse;

export type Frontend = NonNullable<Awaited<ReturnType<typeof findById>>>;
