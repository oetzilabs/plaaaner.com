import { and, eq, isNull, sql } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { db } from "../drizzle/sql";
import {
  OrganizationCreateSchema,
  OrganizationUpdateSchema,
  users_organizations,
  organizations,
} from "../drizzle/sql/schema";

export * as Organization from "./organizations";

export const create = z
  .function(z.tuple([OrganizationCreateSchema, z.string().uuid()]))
  .implement(async (userInput, userId) => {
    const [x] = await db
      .insert(organizations)
      .values({ ...userInput, owner_id: userId })
      .returning();

    return x;
  });

export const countAll = z.function(z.tuple([])).implement(async () => {
  const [x] = await db
    .select({
      count: sql`COUNT(${organizations.id})`,
    })
    .from(organizations);
  return x.count;
});

export const findById = z.function(z.tuple([z.string()])).implement(async (input) => {
  return db.query.organizations.findFirst({
    where: (organizations, operations) => operations.eq(organizations.id, input),
    with: {
      workspaces: {
        with: {
          workspace: {
            with: {
              users: {
                with: {
                  user: true,
                },
              },
            },
          },
        },
      },
      users: {
        with: {
          user: true,
        },
      },
      owner: true,
    },
  });
});

export const findManyByUserId = z.function(z.tuple([z.string().uuid()])).implement(async (input) => {
  const userOs = await db.query.users.findFirst({
    where: (user, operations) => operations.eq(user.id, input),
    with: {
      organizations: {
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
        },
      },
    },
  });
  if (!userOs) return [];

  return userOs.organizations
    .map((x) => x.organization)
    .filter((o) => o?.deletedAt === null)
    .filter((o) => typeof o !== undefined && o !== null);
});

export const findByName = z.function(z.tuple([z.string()])).implement(async (input) => {
  return db.query.organizations.findFirst({
    where: (organizations, operations) => operations.eq(organizations.name, input),
    with: {},
  });
});

export const all = z.function(z.tuple([])).implement(async () => {
  return db.query.organizations.findMany({
    with: {},
  });
});

export const removeCorrupt = z.function(z.tuple([])).implement(async () => {
  const all_corrupt_os = await db.query.organizations.findMany({
    where(fields, op){
      return op.isNull(fields.owner_id);
    },
  });
  for (const os of all_corrupt_os) {
    await db.delete(users_organizations).where(eq(users_organizations.organization_id, os.id)).returning();
    await db.delete(organizations).where(eq(organizations.id, os.id)).returning();
  }
});

export const update = z
  .function(
    z.tuple([
      createInsertSchema(organizations)
        .partial()
        .omit({ createdAt: true, updatedAt: true })
        .merge(z.object({ id: z.string().uuid() })),
    ])
  )
  .implement(async (input) => {
    const [updatedOrganization] = await db
      .update(organizations)
      .set({ ...input, updatedAt: new Date() })
      .where(eq(organizations.id, input.id))
      .returning();
    return updatedOrganization;
  });

export const markAsDeleted = z.function(z.tuple([z.object({ id: z.string().uuid() })])).implement(async (input) => {
  return update({ id: input.id, deletedAt: new Date() });
});

export const connectUser = z
  .function(z.tuple([z.string().uuid(), z.string().uuid()]))
  .implement(async (organization_id, user_id) => {
    const [connected] = await db.insert(users_organizations).values({ user_id, organization_id }).returning();
    return connected;
  });

export const disconnectUser = z
  .function(z.tuple([z.string().uuid(), z.string().uuid()]))
  .implement(async (organization_id, user_id) => {
    const [deleted] = await db
      .delete(users_organizations)
      .where(and(eq(users_organizations.organization_id, workspace_id), eq(users_organizations.user_id, user_id)))
      .returning();
    return deleted;
  });

export const setOwner = z
  .function(z.tuple([z.string().uuid(), z.string().uuid()]))
  .implement(async (organization_id, user_id) => {
    const [updated] = await db
      .update(organizations)
      .set({ owner_id: user_id })
      .where(eq(organizations.id, organization_id))
      .returning();
    return updated;
  });

export const findByUserId = z.function(z.tuple([z.string().uuid()])).implement(async (user_id) => {
  const ws = await db.query.organizations.findFirst({
    where: (organizations, operations) =>
      and(operations.eq(organizations.owner_id, user_id), isNull(organizations.deletedAt)),
    orderBy(fields, operators) {
      return operators.desc(fields.createdAt);
    },
  });
  return ws;
});

export const safeParseCreate = OrganizationCreateSchema.safeParse;
export const safeParseUpdate = OrganizationUpdateSchema.safeParse;

export type Frontend = NonNullable<Awaited<ReturnType<typeof findById>>>;
