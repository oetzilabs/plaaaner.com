import { and, eq, isNull, sql } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { db } from "../drizzle/sql";
import { PostCreateSchema, PostUpdateSchema, post_comments, posts, workspaces_posts } from "../drizzle/sql/schema";
import { Organization } from "./organizations";
import { Workspace } from "./workspaces";
import { User } from "./users";
import dayjs from "dayjs";

export * as Posts from "./posts";

export const create = z
  .function(z.tuple([z.array(PostCreateSchema).or(PostCreateSchema), z.string().uuid(), z.string().uuid()]))
  .implement(async (userInput, userId, workspace_id) => {
    const postsToCreate = Array.isArray(userInput)
      ? userInput.map((p) => ({ ...p, owner_id: userId }))
      : [{ ...userInput, owner_id: userId }];
    const postsCreated = await db.insert(posts).values(postsToCreate).returning();

    await Promise.all(
      postsCreated.map((pl) => db.insert(workspaces_posts).values({ post_id: pl.id, workspace_id }).returning())
    );

    return postsCreated;
  });

export const countAll = z.function(z.tuple([])).implement(async () => {
  const [x] = await db
    .select({
      count: sql`COUNT(${posts.id})`,
    })
    .from(posts);
  return x.count;
});

export const findById = z.function(z.tuple([z.string()])).implement(async (input) => {
  return db.query.posts.findFirst({
    where: (fields, operations) => operations.eq(fields.id, input),
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
      const posts = await findByUserId(user_id, { fromDate });
      return posts;
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

    const ps = await db.query.workspaces_posts.findMany({
      where: (fields, operators) =>
        fromDate
          ? operators.and(operators.eq(fields.workspace_id, workspace.id), operators.gte(fields.createdAt, fromDate))
          : operators.eq(fields.workspace_id, workspace.id),
      orderBy: (fields, operators) => operators.desc(fields.createdAt),
      with: {
        post: {
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
          },
        },
      },
    });

    return ps.map((oe) => oe.post).filter((p) => p.deletedAt === null);
  });

export const findByContent = z.function(z.tuple([z.string()])).implement(async (input) => {
  return db.query.posts.findFirst({
    where: (fields, operations) => operations.eq(fields.content, input),
    with: {
      comments: {
        with: {
          user: true,
        },
      },
      owner: true,
    },
  });
});

export const allNonDeleted = z.function(z.tuple([])).implement(async () => {
  return db.query.posts.findMany({
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
    },
  });
});

export const update = z
  .function(
    z.tuple([
      createInsertSchema(posts)
        .partial()
        .omit({ createdAt: true, updatedAt: true })
        .merge(z.object({ id: z.string().uuid() })),
    ])
  )
  .implement(async (input) => {
    const [updatedOrganization] = await db
      .update(posts)
      .set({ ...input, updatedAt: new Date() })
      .where(eq(posts.id, input.id))
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
      .update(posts)
      .set({ owner_id: user_id })
      .where(eq(posts.id, organization_id))
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
    const ws = await db.query.posts.findMany({
      where: (fields, operations) =>
        options?.fromDate
          ? operations.and(
              operations.eq(fields.owner_id, user_id),
              isNull(fields.deletedAt),
              operations.gte(fields.createdAt, options?.fromDate)
            )
          : operations.and(operations.eq(fields.owner_id, user_id), isNull(fields.deletedAt)),
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
        db.query.workspaces_posts.findMany({
          where: (fields, operators) =>
            options?.fromDate
              ? operators.and(
                  operators.eq(fields.workspace_id, ws.id),
                  operators.gte(fields.createdAt, options.fromDate)
                )
              : operators.eq(fields.workspace_id, ws.id),
          with: {
            post: {
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
              },
            },
          },
        })
      )
    );
    return ps.flat().map((oe) => oe.post);
  });

export const recommendNewPlans = z.function(z.tuple([z.string().uuid()])).implement(async (organization_id) => {
  // const previousPlans = await findByOrganizationId(organization_id);

  return [] as Awaited<ReturnType<typeof findByOrganizationId>>;
});

export const lastCreatedByUser = z.function(z.tuple([z.string().uuid()])).implement(async (user_id) => {
  const ws = await db.query.posts.findFirst({
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
  const orgs = await db.query.posts.findMany({
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

export const addComment = z
  .function(z.tuple([z.string().uuid(), z.string().uuid(), z.string()]))
  .implement(async (post_id, user_id, comment) => {
    const post = await findById(post_id);

    if (!post) {
      throw new Error("This post does not exist");
    }

    const user = await User.findById(user_id);

    if (!user) {
      throw new Error("This user does not exist");
    }

    const [commented] = await db
      .insert(post_comments)
      .values({
        comment,
        postId: post_id,
        userId: user_id,
      })
      .returning();

    return commented;
  });

export const findComment = z.function(z.tuple([z.string().uuid()])).implement(async (comment_id) => {
  const comment = await db.query.post_comments.findFirst({
    where(fields, operators) {
      return operators.eq(fields.id, comment_id);
    },
    with: {
      post: true,
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
  const [removed] = await db.delete(post_comments).where(eq(post_comments.id, comment_id)).returning();
  return removed;
});

export const safeParseCreate = PostCreateSchema.safeParse;
export const safeParseUpdate = PostUpdateSchema.safeParse;

export type Frontend = NonNullable<Awaited<ReturnType<typeof findById>>>;
