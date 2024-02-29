import { and, eq, isNull, sql } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { db } from "../drizzle/sql";
import { OrganizationJoinCreateSchema, OrganizationJoinUpdateSchema, organizations_joins } from "../drizzle/sql/schema";
import { User } from "./users";

export * as OrganizationJoin from "./organizations_joins";

export const create = z
  .function(z.tuple([OrganizationJoinCreateSchema, z.string().uuid()]))
  .implement(async (userInput, userId) => {
    const [x] = await db
      .insert(organizations_joins)
      .values({ ...userInput, user_id: userId })
      .returning();

    return x;
  });

export const countAll = z.function(z.tuple([])).implement(async () => {
  const [x] = await db
    .select({
      count: sql`COUNT(${organizations_joins.id})`,
    })
    .from(organizations_joins);
  return x.count;
});

export const findById = z.function(z.tuple([z.string()])).implement(async (input) => {
  return db.query.organizations_joins.findFirst({
    where: (organizations, operations) => operations.eq(organizations.id, input),
    with: {
      user: true,
      organization: true,
    },
  });
});

export const findManyByUserId = z.function(z.tuple([z.string().uuid()])).implement(async (input) => {
  const userOs = await db.query.users.findFirst({
    where: (user, operations) => operations.eq(user.id, input),
    with: {
      joins: {
        with: {
          organization: {
            with: {
              users: {
                with: {
                  user: true,
                },
              },
              owner: true,
            },
          },
          user: true,
        },
      },
    },
  });
  if (!userOs) return [];

  return userOs.joins;
});

export const all = z.function(z.tuple([])).implement(async () => {
  return db.query.organizations_joins.findMany({
    with: {
      user: true,
      organization: true,
    },
  });
});

export const update = z
  .function(
    z.tuple([
      createInsertSchema(organizations_joins)
        .partial()
        .omit({ createdAt: true, updatedAt: true })
        .merge(z.object({ id: z.string().uuid() })),
    ]),
  )
  .implement(async (input) => {
    const [updatedOrganizationJoin] = await db
      .update(organizations_joins)
      .set({ ...input, updatedAt: new Date() })
      .where(eq(organizations_joins.id, input.id))
      .returning();
    return updatedOrganizationJoin;
  });

export const markAsDeleted = z.function(z.tuple([z.object({ id: z.string().uuid() })])).implement(async (input) => {
  return update({ id: input.id, deletedAt: new Date() });
});

export const findByUserId = z.function(z.tuple([z.string().uuid()])).implement(async (user_id) => {
  const ws = await db.query.organizations_joins.findFirst({
    where: (organizations, operations) =>
      and(operations.eq(organizations.user_id, user_id), isNull(organizations.deletedAt)),
    orderBy(fields, operators) {
      return operators.desc(fields.createdAt);
    },
  });
  return ws;
});

export const safeParseCreate = OrganizationJoinCreateSchema.safeParse;
export const safeParseUpdate = OrganizationJoinUpdateSchema.safeParse;

export type Frontend = NonNullable<Awaited<ReturnType<typeof findById>>>;
