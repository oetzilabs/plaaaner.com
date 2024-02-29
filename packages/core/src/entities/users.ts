import { eq, sql } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { db } from "../drizzle/sql";
import { UserUpdateSchema, users } from "../drizzle/sql/schema";

export * as User from "./users";

export const create = z.function(z.tuple([createInsertSchema(users)])).implement(async (userInput) => {
  const [x] = await db.insert(users).values(userInput).returning();

  return x;
});

export const countAll = z.function(z.tuple([])).implement(async () => {
  const [x] = await db
    .select({
      count: sql`COUNT(${users.id})`,
    })
    .from(users);
  return x.count;
});

export const findById = z.function(z.tuple([z.string()])).implement(async (input) => {
  return db.query.users.findFirst({
    where: (users, operations) => operations.eq(users.id, input),
    with: {},
  });
});

export const findByEmail = z.function(z.tuple([z.string().email()])).implement(async (input) => {
  return db.query.users.findFirst({
    where: (users, operations) => operations.eq(users.email, input),
    with: {},
  });
});

export const findByName = z.function(z.tuple([z.string()])).implement(async (input) => {
  return db.query.users.findFirst({
    where: (users, operations) => operations.eq(users.name, input),
    with: {},
  });
});

export const all = z.function(z.tuple([])).implement(async () => {
  return db.query.users.findMany({
    with: {},
  });
});

export const update = z
  .function(
    z.tuple([
      createInsertSchema(users)
        .partial()
        .omit({ createdAt: true, updatedAt: true })
        .merge(z.object({ id: z.string().uuid() })),
    ]),
  )
  .implement(async (input) => {
    const [u] = await db
      .update(users)
      .set({ ...input, updatedAt: new Date() })
      .where(eq(users.id, input.id))
      .returning();
    return u;
  });

export const markAsDeleted = z.function(z.tuple([z.object({ id: z.string().uuid() })])).implement(async (input) => {
  return update({ id: input.id, deletedAt: new Date() });
});

export const updateName = z
  .function(z.tuple([z.object({ id: z.string().uuid(), name: z.string() })]))
  .implement(async (input) => {
    return update({ id: input.id, name: input.name });
  });

export const safeParseUpdate = UserUpdateSchema.safeParse;

export const isAllowedToSignUp = z.function(z.tuple([z.object({ email: z.string() })])).implement(async (input) => {
  return true;
});

export type Frontend = NonNullable<Awaited<ReturnType<typeof findById>>>;
