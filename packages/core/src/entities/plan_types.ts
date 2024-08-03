import { and, eq, isNull, sql } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { prefixed_cuid2 } from "../custom_cuid2";
import { db } from "../drizzle/sql";
import { plan_types, plans, PlanTypeCreateSchema, PlanTypeUpdateSchema } from "../drizzle/sql/schema";

export * as PlanTypes from "./plan_types";

export const DEFAULT_PLAN_TYPES: Parameters<typeof create>[0] = [
  {
    name: "event",
    description: "",
  },
  {
    name: "concert",
    description: "",
  },
  {
    name: "tournament",
    description: "",
  },
  {
    name: "custom-event",
    description: "",
  },
] as const;

export const create = z
  .function(z.tuple([PlanTypeCreateSchema.array(), prefixed_cuid2.nullable()]))
  .implement(async (plan_types_to_create, user_id) => {
    const names = plan_types_to_create.map((tt) => tt.name);
    const existing = await db.query.plan_types.findMany({
      where(fields, operators) {
        return operators.inArray(fields.name, names);
      },
    });

    const missing_new_tickets = plan_types_to_create.filter((tt) => !existing.some((tt2) => tt2.name === tt.name));
    if (missing_new_tickets.length === 0) {
      return [];
    }

    const new_plan_types = await db
      .insert(plan_types)
      .values(missing_new_tickets.map((tt) => ({ ...tt, owner_id: user_id })))
      .returning();

    return new_plan_types;
  });

export const upsert = z
  .function(z.tuple([PlanTypeCreateSchema.array(), prefixed_cuid2.nullable()]))
  .implement(async (plan_types_to_create, user_id) => {
    const updated = [];
    const names = plan_types_to_create.map((tt) => tt.name);
    const existing = await db.query.plan_types.findMany({
      where(fields, operators) {
        return operators.inArray(fields.name, names);
      },
    });

    for await (const e of existing) {
      const to_update = plan_types_to_create.find((tttc) => tttc.name === e.name)!;
      const u = await db.update(plan_types).set(to_update).where(eq(plan_types.name, e.name)).returning();
      updated.push(u);
    }

    const missing_new_tickets = plan_types_to_create.filter((tt) => !existing.some((tt2) => tt2.name === tt.name));
    if (missing_new_tickets.length === 0) {
      return updated;
    }

    const new_plan_types = await db
      .insert(plan_types)
      .values(missing_new_tickets.map((tt) => ({ ...tt, owner_id: user_id })))
      .returning();

    updated.push(...new_plan_types);

    return updated;
  });
export const countAll = z.function(z.tuple([])).implement(async () => {
  const [x] = await db
    .select({
      count: sql`COUNT(${plan_types.id})`,
    })
    .from(plan_types);
  return x.count;
});

export const findById = z.function(z.tuple([z.string()])).implement(async (input) => {
  return db.query.plan_types.findFirst({
    where: (plan_types, operations) => operations.eq(plan_types.id, input),
    with: {
      owner: true,
    },
  });
});

export const findByName = z.function(z.tuple([z.string()])).implement(async (input) => {
  return db.query.plan_types.findFirst({
    where: (plan_types, operations) => operations.eq(plan_types.name, input),
    with: {},
  });
});

export const allNonDeleted = z.function(z.tuple([])).implement(async () => {
  return db.query.plan_types.findMany({
    with: {},
    where(fields, operations) {
      return operations.isNull(fields.deletedAt);
    },
  });
});

export const all = z.function(z.tuple([])).implement(async () => {
  return db.query.plan_types.findMany({
    with: {},
  });
});

export const update = z
  .function(
    z.tuple([
      createInsertSchema(plan_types)
        .partial()
        .omit({ createdAt: true, updatedAt: true })
        .merge(z.object({ id: prefixed_cuid2 })),
    ]),
  )
  .implement(async (input) => {
    const [updatedOrganization] = await db
      .update(plan_types)
      .set({ ...input, updatedAt: new Date() })
      .where(eq(plan_types.id, input.id))
      .returning();
    return updatedOrganization;
  });

export const markAsDeleted = z.function(z.tuple([z.object({ id: prefixed_cuid2 })])).implement(async (input) => {
  return update({ id: input.id, deletedAt: new Date() });
});

export const setOwner = z
  .function(z.tuple([prefixed_cuid2, prefixed_cuid2]))
  .implement(async (organization_id, user_id) => {
    const [updated] = await db
      .update(plan_types)
      .set({ owner_id: user_id })
      .where(eq(plan_types.id, organization_id))
      .returning();
    return updated;
  });

export const findByUserId = z.function(z.tuple([prefixed_cuid2])).implement(async (user_id) => {
  const ws = await db.query.plan_types.findFirst({
    where: (plan_types, operations) => and(operations.eq(plan_types.owner_id, user_id), isNull(plan_types.deletedAt)),
    orderBy(fields, operators) {
      return operators.desc(fields.createdAt);
    },
  });
  return ws;
});

export const lastCreatedByUser = z.function(z.tuple([prefixed_cuid2])).implement(async (user_id) => {
  const ws = await db.query.plan_types.findFirst({
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
  const et = await db.query.plan_types.findFirst({
    where(fields, operators) {
      return operators.eq(fields.name, t);
    },
  });
  return et;
});

export const getDefaultTypeId = z.function(z.tuple([])).implement(async () => {
  const et = await db.query.plan_types.findFirst({
    where(fields, operators) {
      return operators.eq(fields.name, DEFAULT_PLAN_TYPES[0].name);
    },
    columns: {
      id: true,
    },
  });
  if (!et) {
    throw new Error("DEFAULT PLAN IS NOT SEEDED!");
  }
  return et.id;
});

export const getDefaultFreePlanType = z.function(z.tuple([])).implement(async () => {
  const et = await db.query.plan_types.findFirst({
    where(fields, operators) {
      return operators.eq(fields.name, DEFAULT_PLAN_TYPES[1].name);
    },
  });
  if (!et) {
    throw new Error("DEFAULT PLAN IS NOT SEEDED!");
  }
  return et;
});

export const getAllTypes = z.function(z.tuple([])).implement(async () => {
  const all_plan_types = await db.query.plan_types.findMany();
  return all_plan_types;
});

export const getDefaultCount = z.function(z.tuple([])).implement(async () => {
  return DEFAULT_PLAN_TYPES.length;
});

export const safeParseCreate = PlanTypeCreateSchema.safeParse;
export const safeParseUpdate = PlanTypeUpdateSchema.safeParse;

export type Frontend = NonNullable<Awaited<ReturnType<typeof findById>>>;
