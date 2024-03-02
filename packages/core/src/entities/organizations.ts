import { and, eq, isNull, notExists, sql } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { db } from "../drizzle/sql";
import {
  OrganizationCreateSchema,
  OrganizationUpdateSchema,
  users_organizations,
  organizations,
  organizations_ticket_types,
} from "../drizzle/sql/schema";
import { User } from "./users";
import { OrganizationJoin } from "./organizations_joins";
import dayjs from "dayjs";
import { TicketTypes } from "./ticket_types";

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
              ticket_types: {
                with: {
                  ticket_type: true,
                },
              },
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

export const allNonDeleted = z.function(z.tuple([])).implement(async () => {
  return db.query.organizations.findMany({
    with: {},
    where(fields, operations) {
      return operations.isNull(fields.deletedAt);
    },
  });
});

export const all = z.function(z.tuple([])).implement(async () => {
  return db.query.organizations.findMany({
    with: {},
  });
});

export const update = z
  .function(
    z.tuple([
      createInsertSchema(organizations)
        .partial()
        .omit({ createdAt: true, updatedAt: true })
        .merge(z.object({ id: z.string().uuid() })),
    ]),
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
      .where(and(eq(users_organizations.organization_id, organization_id), eq(users_organizations.user_id, user_id)))
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

export const lastCreatedByUser = z.function(z.tuple([z.string().uuid()])).implement(async (user_id) => {
  const ws = await db.query.organizations.findFirst({
    where: (fields, operators) => and(operators.eq(fields.owner_id, user_id), operators.isNull(fields.deletedAt)),
    orderBy(fields, operators) {
      return operators.desc(fields.createdAt);
    },
  });
  return ws;
});

export const requestJoin = z
  .function(z.tuple([z.string().uuid(), z.string().uuid()]))
  .implement(async (organization_id, user_id) => {
    const org = await findById(organization_id);
    const user = await User.findById(user_id);
    if (!org) {
      throw new Error("Organization does not exist");
    }
    if (!user) {
      throw new Error("User does not exist");
    }

    const organizationJoin = await OrganizationJoin.create(
      {
        type: "request",
        expiresAt: dayjs().add(1, "week").toDate(),
        organization_id: org.id,
      },
      user.id,
    );

    return organizationJoin;
  });

export const notConnectedToUserById = z.function(z.tuple([z.string().uuid()])).implement(async (user_id) => {
  const usersOrgsResult = await db.query.users_organizations.findMany({
    where(fields, operators) {
      return operators.and(operators.eq(fields.user_id, user_id), operators.isNull(fields.deletedAt));
    },
  });
  const userOrgs = usersOrgsResult.map((uo) => uo.organization_id);
  const orgs = await db.query.organizations.findMany({
    where(fields, operators) {
      return operators.and(operators.notInArray(fields.id, userOrgs), operators.isNull(fields.deletedAt));
    },
    with: {
      owner: true,
      users: true,
    },
  });
  return orgs;
});

export const getAllTicketTypes = z.function(z.tuple([z.string().uuid()])).implement(async (organization_id) => {
  const orgs_ticket_types = await db.query.organizations_ticket_types.findMany({
    with: {
      ticket_type: true,
    },
  });
  return orgs_ticket_types.map((ott) => ott.ticket_type);
});

export const getAllNonDeletedTicketTypes = z.function(z.tuple([z.string().uuid()])).implement(async (organization_id) => {
  const orgs_ticket_types = await db.query.organizations_ticket_types.findMany({
    where(fields, operators) {
      return operators.isNull(fields.deletedAt);
    },
    with: {
      ticket_type: true,
    },
  });
  return orgs_ticket_types.map((ott) => ott.ticket_type);
});

export const getTicketTypesByOrganization = z.function(z.tuple([z.string().uuid()])).implement(async (organization_id) => {
  const orgs_ticket_types = await db.query.organizations_ticket_types.findMany({
    where(fields, operators) {
      return operators.and(operators.eq(fields.organization_id, organization_id), operators.isNull(fields.deletedAt));
    },
    with: {
      ticket_type: true,
    },
  });
  return orgs_ticket_types.map((ott) => ott.ticket_type);
});

export const fillDefaultTicketTypes = z.function(z.tuple([z.string().uuid()])).implement(async (organization_id) => {
  const existing = await db.query.ticket_types.findMany({
    where(fields, operators) {
      return operators.inArray(
        fields.name,
        TicketTypes.DEFAULT_TICKET_TYPES.map((t) => t.name),
      );
    },
    columns: {
      id: true,
    },
  });
  const connected_ticket_type_to_org = await db
    .insert(organizations_ticket_types)
    .values(existing.map((ett) => ({ ticket_type_id: ett.id, organization_id })))
    .returning();
  return connected_ticket_type_to_org;
});

export const safeParseCreate = OrganizationCreateSchema.safeParse;
export const safeParseUpdate = OrganizationUpdateSchema.safeParse;

export type Frontend = NonNullable<Awaited<ReturnType<typeof findById>>>;
