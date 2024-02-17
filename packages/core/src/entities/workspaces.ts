import { eq, sql } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { db } from "../drizzle/sql";
import { workspaces } from "../drizzle/sql/schema";

export * as Workspace from "./workspaces";

export const create = z.function(z.tuple([createInsertSchema(workspaces)])).implement(async (userInput) => {
  const [x] = await db.insert(workspaces).values(userInput).returning();

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
    with: {},
  });
});

export const findManyByUserId = z.function(z.tuple([z.string()])).implement(async (input) => {
  const userWs = await db.query.users.findFirst({
    where: (user, operations) => operations.eq(user.id, input),
    with: {
      workspaces: {
        with: {
          workspace: true,
        },
      },
    },
  });
  if (!userWs) return [];

  return userWs.workspaces.map((x) => x.workspace);
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

const update = z
  .function(
    z.tuple([
      createInsertSchema(workspaces)
        .partial()
        .omit({ createdAt: true, updatedAt: true })
        .merge(z.object({ id: z.string().uuid() })),
    ])
  )
  .implement(async (input) => {
    await db
      .update(workspaces)
      .set({ ...input, updatedAt: new Date() })
      .where(eq(workspaces.id, input.id))
      .returning();
    return true;
  });

export const markAsDeleted = z.function(z.tuple([z.object({ id: z.string().uuid() })])).implement(async (input) => {
  return update({ id: input.id, deletedAt: new Date() });
});

export const updateName = z
  .function(z.tuple([z.object({ id: z.string().uuid(), name: z.string() })]))
  .implement(async (input) => {
    return update({ id: input.id, name: input.name });
  });

export type Frontend = NonNullable<Awaited<ReturnType<typeof findById>>>;
