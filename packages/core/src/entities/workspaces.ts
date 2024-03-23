import { and, eq, isNull, sql } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { db } from "../drizzle/sql";
import { WorkspaceCreateSchema, WorkspaceUpdateSchema, users_workspaces, workspaces, workspaces_organizations } from "../drizzle/sql/schema";
import { Organization } from "./organizations";

export * as Workspace from "./workspaces";

export const create = z
  .function(z.tuple([WorkspaceCreateSchema, z.string().uuid(), z.string().uuid()]))
  .implement(async (userInput, owner_id, organization_id) => {
    const [workspace] = await db
    .insert(workspaces)
    .values({
      ...userInput,
      owner_id,
    })
    .returning();

    await db.insert(workspaces_organizations).values({
      workspace_id: workspace.id,
      organization_id,
    });

    return workspace;
  });

export const countAll = z.function(z.tuple([])).implement(async () => {
  const [x] = await db
    .select({
      count: sql`COUNT(${workspaces.id})`,
    })
    .from(workspaces);
  return x.count;
});

export const findById = z.function(z.tuple([z.string()])).implement(async (input) => {
  return db.query.workspaces.findFirst({
    where: (workspaces, operations) => operations.eq(workspaces.id, input),
    with: {
      users: {
        with: {
          user: true,
        },
      },
      owner: true,
    },
  });
});

export const findByOrganizationId = z.function(z.tuple([z.string()])).implement(async (input) => {
  const ws = await db.query.workspaces_organizations.findMany({
    where: (workspaces, operations) => operations.eq(workspaces.workspace_id, input),
    with: {
      workspace: true,
    },
  });
  return ws.map((w) => w.workspace);
});

export const hasUser = z
  .function(z.tuple([z.string().uuid(), z.string().uuid()]))
  .implement(async (workspace_id, user_id) => {
    const isConnected = await db.query.users_workspaces.findFirst({
      where: (fields, operators) =>
        operators.and(operators.eq(fields.workspace_id, workspace_id), operators.eq(fields.user_id, user_id)),
    });

    return !!isConnected;
  });

export const findManyByUserId = z.function(z.tuple([z.string().uuid()])).implement(async (input) => {
  const userWs = await db.query.workspaces.findMany({
    where: (fields, operations) =>
      operations.and(operations.eq(fields.owner_id, input), operations.isNull(fields.deletedAt)),
    with: {
      users: {
        with: {
          user: true,
        },
      },
      owner: true,
    },
  });
  if (!userWs) return [];

  return userWs;
});

export const findByName = z.function(z.tuple([z.string()])).implement(async (input) => {
  return db.query.workspaces.findFirst({
    where: (workspaces, operations) => operations.eq(workspaces.name, input),
    with: {
      users: {
        with: {
          user: true,
        },
      },
      owner: true,
    },
  });
});

export const all = z.function(z.tuple([])).implement(async () => {
  return db.query.workspaces.findMany({
    with: {
      users: {
        with: {
          user: true,
        },
      },
      owner: true,
    },
  });
});

export const update = z
  .function(
    z.tuple([
      createInsertSchema(workspaces)
        .partial()
        .omit({ createdAt: true, updatedAt: true })
        .merge(z.object({ id: z.string().uuid() })),
    ])
  )
  .implement(async (input) => {
    const [updatedWorkspace] = await db
      .update(workspaces)
      .set({ ...input, updatedAt: new Date() })
      .where(eq(workspaces.id, input.id))
      .returning();
    return updatedWorkspace;
  });

export const markAsDeleted = z.function(z.tuple([z.object({ id: z.string().uuid() })])).implement(async (input) => {
  return update({ id: input.id, deletedAt: new Date() });
});

export const connectUser = z
  .function(z.tuple([z.string().uuid(), z.string().uuid()]))
  .implement(async (workspace_id, user_id) => {
    const isConnected = await db.query.users_workspaces.findFirst({
      where: (fields, operators) =>
        operators.and(operators.eq(fields.workspace_id, workspace_id), operators.eq(fields.user_id, user_id)),
    });
    if (!isConnected) {
      await db.insert(users_workspaces).values({ user_id, workspace_id }).returning();
    }
  });

export const disconnectUser = z
  .function(z.tuple([z.string().uuid(), z.string().uuid()]))
  .implement(async (workspace_id, user_id) => {
    const [deleted] = await db
      .delete(users_workspaces)
      .where(and(eq(users_workspaces.workspace_id, workspace_id), eq(users_workspaces.user_id, user_id)))
      .returning();
    return deleted;
  });

export const setOwner = z
  .function(z.tuple([z.string().uuid(), z.string().uuid()]))
  .implement(async (workspace_id, user_id) => {
    const [updated] = await db
      .update(workspaces)
      .set({ owner_id: user_id })
      .where(eq(workspaces.id, workspace_id))
      .returning();
    return updated;
  });

export const lastCreatedByUser = z.function(z.tuple([z.string().uuid()])).implement(async (user_id) => {
  const ws = await db.query.workspaces.findFirst({
    where: (workspaces, operations) => and(operations.eq(workspaces.owner_id, user_id), isNull(workspaces.deletedAt)),
    orderBy(fields, operators) {
      return operators.desc(fields.createdAt);
    },
  });
  return ws;
});

export const safeParseCreate = WorkspaceCreateSchema.safeParse;
export const safeParseUpdate = WorkspaceUpdateSchema.safeParse;

export type Frontend = NonNullable<Awaited<ReturnType<typeof findById>>>;
