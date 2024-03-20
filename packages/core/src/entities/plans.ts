import { and, eq, isNull, sql } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { db } from "../drizzle/sql";
import {
  PlanCreateSchema,
  PlanTimesCreateSchema,
  PlanUpdateSchema,
  plan_times,
  plans,
  workspaces_plans,
} from "../drizzle/sql/schema";
import { Workspace } from "./workspaces";

export * as Plans from "./plans";

export const create = z
  .function(z.tuple([z.array(PlanCreateSchema).or(PlanCreateSchema), z.string().uuid(), z.string().uuid()]))
  .implement(async (userInput, userId, workspace_id) => {
    const plansToCreate = Array.isArray(userInput)
      ? userInput.map((p) => ({ ...p, owner_id: userId }))
      : [{ ...userInput, owner_id: userId }];
    const plansCreated = await db.insert(plans).values(plansToCreate).returning();
    const connectedToWorkspace = await db.insert(workspaces_plans).values({ plan_id: x.id, workspace_id }).returning();

    return plansCreated;
  });

export const countAll = z.function(z.tuple([])).implement(async () => {
  const [x] = await db
    .select({
      count: sql`COUNT(${plans.id})`,
    })
    .from(plans);
  return x.count;
});

export const findById = z.function(z.tuple([z.string()])).implement(async (input) => {
  return db.query.plans.findFirst({
    where: (plans, operations) => operations.eq(plans.id, input),
    with: {
      owner: true,
    },
  });
});

export const findBy = z
  .function(
    z.tuple([
      z.object({
        user_id: z.string().uuid().nullable(),
        workspace_id: z.string().uuid().nullable(),
        organization_id: z.string().uuid().nullable(),
      }),
    ])
  )
  .implement(async ({ user_id, organization_id, workspace_id }) => {
    if (!user_id) {
      throw new Error("User Id is missing");
    }
    if (!organization_id || !workspace_id) {
      // get all plans
      const plans = await findByUserId(user_id);
      return plans;
    }
    if (!workspace_id) {
      const orgplans = await findByOrganizationId(organization_id);
      return orgplans;
    }
    const workspaces = await Workspace.findByOrganizationId(organization_id);
    const ps = await Promise.all(
      workspaces.map(async (ws) =>
        db.query.workspaces_plans.findMany({
          where: (fields, operators) => operators.eq(fields.workspace_id, ws.id),
          with: {
            plan: true,
          },
        })
      )
    );
    return ps
      .flat()
      .filter((oe) => oe.workspace_id === workspace_id)
      .map((oe) => oe.plan);
  });

export const findByName = z.function(z.tuple([z.string()])).implement(async (input) => {
  return db.query.plans.findFirst({
    where: (plans, operations) => operations.eq(plans.name, input),
    with: {},
  });
});

export const allNonDeleted = z.function(z.tuple([])).implement(async () => {
  return db.query.plans.findMany({
    with: {},
    where(fields, operations) {
      return operations.isNull(fields.deletedAt);
    },
  });
});

export const all = z.function(z.tuple([])).implement(async () => {
  return db.query.plans.findMany({
    with: {},
  });
});

export const update = z
  .function(
    z.tuple([
      createInsertSchema(plans)
        .partial()
        .omit({ createdAt: true, updatedAt: true })
        .merge(z.object({ id: z.string().uuid() })),
    ])
  )
  .implement(async (input) => {
    const [updatedOrganization] = await db
      .update(plans)
      .set({ ...input, updatedAt: new Date() })
      .where(eq(plans.id, input.id))
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
      .update(plans)
      .set({ owner_id: user_id })
      .where(eq(plans.id, organization_id))
      .returning();
    return updated;
  });

export const findByUserId = z.function(z.tuple([z.string().uuid()])).implement(async (user_id) => {
  const ws = await db.query.plans.findMany({
    where: (plans, operations) => and(operations.eq(plans.owner_id, user_id), isNull(plans.deletedAt)),
    orderBy(fields, operators) {
      return operators.desc(fields.createdAt);
    },
  });
  return ws;
});

export const findByOrganizationId = z.function(z.tuple([z.string().uuid()])).implement(async (organization_id) => {
  const workspaces = await Workspace.findByOrganizationId(organization_id);
  const ps = await Promise.all(
    workspaces.map(async (ws) =>
      db.query.workspaces_plans.findMany({
        where: (fields, operators) => operators.eq(fields.workspace_id, ws.id),
        with: {
          plan: true,
        },
      })
    )
  );
  return ps.flat().map((oe) => oe.plan);
});

export const recommendNewPlans = z.function(z.tuple([z.string().uuid()])).implement(async (organization_id) => {
  // const previousPlans = await findByOrganizationId(organization_id);

  return [] as Awaited<ReturnType<typeof findByOrganizationId>>;
});

export const lastCreatedByUser = z.function(z.tuple([z.string().uuid()])).implement(async (user_id) => {
  const ws = await db.query.plans.findFirst({
    where: (fields, operators) => and(operators.eq(fields.owner_id, user_id), operators.isNull(fields.deletedAt)),
    orderBy(fields, operators) {
      return operators.desc(fields.createdAt);
    },
  });
  return ws;
});

export const notConnectedToUserById = z.function(z.tuple([z.string().uuid()])).implement(async (user_id) => {
  const usersOrgsResult = await db.query.users_organizations.findMany({
    where(fields, operators) {
      return operators.eq(fields.user_id, user_id);
    },
  });
  const userOrgs = usersOrgsResult.map((uo) => uo.organization_id);
  const orgs = await db.query.plans.findMany({
    where(fields, operators) {
      return operators.and(operators.notInArray(fields.id, userOrgs), operators.isNull(fields.deletedAt));
    },
    with: {
      owner: true,
    },
  });
  return orgs;
});

export const getTypeId = z.function(z.tuple([z.string()])).implement(async (t) => {
  const et = await db.query.plan_types.findFirst({
    where(fields, operators) {
      return operators.eq(fields.name, t);
    },
  });
  return et;
});

export const createTimeSlots = z
  .function(z.tuple([PlanTimesCreateSchema.array(), z.string().uuid()]))
  .implement(async (timeslots, userId) => {
    const createdTimeSlots = await db
      .insert(plan_times)
      .values(timeslots.map((ts) => ({ ...ts, owner_id: userId })))
      .returning();
    return createdTimeSlots;
  });

export const safeParseCreate = PlanCreateSchema.safeParse;
export const safeParseUpdate = PlanUpdateSchema.safeParse;

export type Frontend = NonNullable<Awaited<ReturnType<typeof findById>>>;
