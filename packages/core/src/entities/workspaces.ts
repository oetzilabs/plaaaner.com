import { and, eq, isNull, sql } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { db } from "../drizzle/sql";
import { WorkspaceCreateSchema, WorkspaceUpdateSchema, users_workspaces, workspaces } from "../drizzle/sql/schema";

export * as Workspace from "./workspaces";

export const create = z
  .function(z.tuple([WorkspaceCreateSchema, z.string().uuid()]))
  .implement(async (userInput, owner_id) => {
    const [x] = await db
      .insert(workspaces)
      .values({
        ...userInput,
        owner_id,
      })
      .returning();

    return x;
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

export const findManyByUserId = z.function(z.tuple([z.string().uuid()])).implement(async (input) => {
  const userWs = await db.query.users.findFirst({
    where: (user, operations) => operations.eq(user.id, input),
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
              owner: true,
            },
          },
        },
      },
    },
  });
  if (!userWs) return [];

  return userWs.workspaces.map((x) => x.workspace).filter((w) => w.deletedAt === null);
});

export const findByName = z.function(z.tuple([z.string()])).implement(async (input) => {
  return db.query.workspaces.findFirst({
    where: (workspaces, operations) => operations.eq(workspaces.name, input),
    with: {},
  });
});

export const all = z.function(z.tuple([])).implement(async () => {
  return db.query.workspaces.findMany({
    with: {},
  });
});

export const update = z
  .function(
    z.tuple([
      createInsertSchema(workspaces)
        .partial()
        .omit({ createdAt: true, updatedAt: true })
        .merge(z.object({ id: z.string().uuid() })),
    ]),
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
    const [connected] = await db.insert(users_workspaces).values({ user_id, workspace_id }).returning();
    return connected;
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
