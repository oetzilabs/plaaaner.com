import { and, eq, sql } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { db } from "../drizzle/sql";
import {
  PlanCreateSchema,
  PlanTimesCreateSchema,
  PlanUpdateSchema,
  plan_comments,
  plan_times,
  plans,
  workspaces_plans,
} from "../drizzle/sql/schema";
import { Organization } from "./organizations";
import { Workspace } from "./workspaces";
import { User } from "./users";

export * as Plans from "./plans";

export const ConcertLocationSchema = z.discriminatedUnion("location_type", [
  z.object({
    location_type: z.literal("online"),
    url: z.string().url(),
  }),
  z.object({
    location_type: z.literal("venue"),
    address: z.string(),
  }),
  z.object({
    location_type: z.literal("festival"),
    address: z.string(),
  }),
  z.object({
    location_type: z.literal("other"),
    details: z.string(),
  }),
]);

export type ConcertLocation = z.infer<typeof ConcertLocationSchema>;

export const create = z
  .function(z.tuple([z.array(PlanCreateSchema).or(PlanCreateSchema), z.string().uuid(), z.string().uuid()]))
  .implement(async (userInput, userId, workspace_id) => {
    const plansToCreate = Array.isArray(userInput)
      ? userInput.map((p) => ({ ...p, owner_id: userId }))
      : [{ ...userInput, owner_id: userId }];
    const plansCreated = await db.insert(plans).values(plansToCreate).returning();

    await Promise.all(
      plansCreated.map((pl) => db.insert(workspaces_plans).values({ plan_id: pl.id, workspace_id }).returning())
    );

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
      comments: {
        orderBy(fields, operators) {
          return operators.desc(fields.createdAt);
        },
        with: {
          user: true,
        },
      },
      workspaces: true,
      owner: true,
    },
  });
});

export const findBy = z
  .function(
    z.tuple([
      z.object({
        user_id: z.string().uuid(),
        workspace_id: z.string().uuid().nullable(),
        organization_id: z.string().uuid().nullable(),
        fromDate: z.date().nullable(),
      }),
    ])
  )
  .implement(async ({ user_id, organization_id, workspace_id, fromDate }) => {
    if (!organization_id) {
      // get all plans
      const plans = await findByUserId(user_id, { fromDate });
      return plans;
    }

    const isUserInOrganization = await Organization.hasUser(organization_id, user_id);
    if (!isUserInOrganization) {
      throw new Error("User is not in Organization");
    }

    if (!workspace_id) {
      const orgplans = await findByOrganizationId(organization_id, { fromDate });
      return orgplans;
    }

    const workspace = await Workspace.findById(workspace_id);
    if (!workspace) {
      throw new Error("This workspace does not exist");
    }

    const isUserInWorkspace = await Workspace.hasUser(workspace.id, user_id);

    if (!isUserInWorkspace) {
      throw new Error("User is not in Workspace");
    }

    const ps = await db.query.workspaces_plans.findMany({
      where: (fields, operators) =>
        fromDate
          ? operators.and(operators.eq(fields.workspace_id, workspace.id), operators.gte(fields.createdAt, fromDate))
          : operators.eq(fields.workspace_id, workspace.id),
      orderBy: (fields, operators) => operators.desc(fields.createdAt),
      with: {
        plan: {
          with: {
            comments: {
              orderBy(fields, operators) {
                return operators.desc(fields.createdAt);
              },
              with: {
                user: true,
              },
            },
            owner: true,
            workspaces: true,
          },
        },
      },
    });

    return ps.map((oe) => oe.plan).filter((p) => p.deletedAt === null);
  });

export const findByName = z.function(z.tuple([z.string()])).implement(async (input) => {
  return db.query.plans.findFirst({
    where: (plans, operations) => operations.eq(plans.name, input),
    with: {
      comments: {
        with: {
          user: true,
        },
      },
      owner: true,
      workspaces: true,
    },
  });
});

export const allNonDeleted = z.function(z.tuple([])).implement(async () => {
  return db.query.plans.findMany({
    with: {
      comments: {
        orderBy(fields, operators) {
          return operators.desc(fields.createdAt);
        },
        with: {
          user: true,
        },
      },
      owner: true,
      workspaces: true,
    },
    where(fields, operations) {
      return operations.isNull(fields.deletedAt);
    },
  });
});

export const all = z.function(z.tuple([])).implement(async () => {
  return db.query.plans.findMany({
    with: {
      comments: {
        with: {
          user: true,
        },
      },
      owner: true,
      workspaces: true,
    },
  });
});

export const update = z
  .function(
    z.tuple([
      createInsertSchema(plans)
        .partial()
        .omit({ createdAt: true, updatedAt: true, location: true })
        .merge(z.object({ id: z.string().uuid(), location: ConcertLocationSchema.optional() })),
    ])
  )
  .implement(async (input) => {
    const [updatedPlan] = await db
      .update(plans)
      .set({ ...input, updatedAt: new Date() })
      .where(eq(plans.id, input.id))
      .returning();
    return updatedPlan;
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

export const findByUserId = z
  .function(
    z.tuple([
      z.string().uuid(),
      z
        .object({
          fromDate: z.date().nullable(),
        })
        .optional(),
    ])
  )
  .implement(async (user_id, options) => {
    const ws = await db.query.plans.findMany({
      where: (plans, operations) =>
        options?.fromDate
          ? operations.and(
              operations.eq(plans.owner_id, user_id),
              operations.isNull(plans.deletedAt),
              operations.gte(plans.createdAt, options?.fromDate)
            )
          : operations.and(operations.eq(plans.owner_id, user_id), operations.isNull(plans.deletedAt)),
      orderBy(fields, operators) {
        return operators.desc(fields.createdAt);
      },
      with: {
        owner: true,
        comments: {
          orderBy(fields, operators) {
            return operators.desc(fields.createdAt);
          },
          with: {
            user: true,
          },
        },
        workspaces: true,
      },
    });
    return ws;
  });

export const findByOrganizationId = z
  .function(
    z.tuple([
      z.string().uuid(),
      z
        .object({
          fromDate: z.date().nullable(),
        })
        .optional(),
    ])
  )
  .implement(async (organization_id, options) => {
    const workspaces = await Workspace.findByOrganizationId(organization_id);
    const ps = await Promise.all(
      workspaces.map(async (ws) =>
        db.query.workspaces_plans.findMany({
          where: (fields, operators) =>
            options?.fromDate
              ? operators.and(
                  operators.eq(fields.workspace_id, ws.id),
                  operators.gte(fields.createdAt, options.fromDate)
                )
              : operators.eq(fields.workspace_id, ws.id),
          with: {
            plan: {
              with: {
                comments: {
                  orderBy(fields, operators) {
                    return operators.desc(fields.createdAt);
                  },
                  with: {
                    user: true,
                  },
                },
                owner: true,
                workspaces: true,
              },
            },
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
    with: {
      comments: {
        with: {
          user: true,
        },
      },
      owner: true,
      workspaces: true,
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
      comments: {
        orderBy(fields, operators) {
          return operators.desc(fields.createdAt);
        },
        with: {
          user: true,
        },
      },
      owner: true,
      workspaces: true,
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

export const nearbyPlans = z
  .function(
    z.tuple([
      z.object({
        lat: z.number(),
        lng: z.number(),
      }),
    ])
  )
  .implement(async (location) => {
    return Promise.resolve([
      {
        id: "123",
        name: "test",
        url: "/plans/123",
        description: "this is a test plan",
        type: "custom",
      },
      {
        id: "456",
        name: "test-2",
        url: "/plans/456",
        description: "this is a test plan 2",
        type: "event",
      },
    ]);
  });

export const getLocation = z.function(z.tuple([z.string().uuid()])).implement(async (id) => {
  const plan = await findById(id);
  if (!plan) {
    throw new Error("This plan does not exist");
  }

  return plan.location;
});

export const addComment = z
  .function(z.tuple([z.string().uuid(), z.string().uuid(), z.string()]))
  .implement(async (plan_id, user_id, comment) => {
    const plan = await findById(plan_id);

    if (!plan) {
      throw new Error("This plan does not exist");
    }

    const user = await User.findById(user_id);

    if (!user) {
      throw new Error("This user does not exist");
    }

    const [commented] = await db
      .insert(plan_comments)
      .values({
        comment,
        planId: plan_id,
        userId: user_id,
      })
      .returning();

    return commented;
  });

export const findComment = z.function(z.tuple([z.string().uuid()])).implement(async (comment_id) => {
  const comment = await db.query.plan_comments.findFirst({
    where(fields, operators) {
      return operators.eq(fields.id, comment_id);
    },
    with: {
      plan: true,
      user: true,
    },
  });
  return comment;
});

export const deleteComment = z.function(z.tuple([z.string().uuid()])).implement(async (comment_id) => {
  const comment = await findComment(comment_id);
  if (!comment) {
    throw new Error("This comment does not exist");
  }
  const [removed] = await db.delete(plan_comments).where(eq(plan_comments.id, comment_id)).returning();
  return removed;
});

export const removeAll = z.function(z.tuple([])).implement(async () => {
  const removed = await db.delete(plans).returning();
  return removed;
});

export const safeParseCreate = PlanCreateSchema.safeParse;
export const safeParseUpdate = PlanUpdateSchema.safeParse;

export type Frontend = NonNullable<Awaited<ReturnType<typeof findById>>>;
