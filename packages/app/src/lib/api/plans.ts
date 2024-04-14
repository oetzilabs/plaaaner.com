import {
  PlanCreateSchema,
  PlanTimesCreateSchema,
  TicketCreateSchema,
} from "@oetzilabs-plaaaner-com/core/src/drizzle/sql/schema";
import { Plans } from "@oetzilabs-plaaaner-com/core/src/entities/plans";
import { TicketTypes } from "@oetzilabs-plaaaner-com/core/src/entities/ticket_types";
import { Tickets } from "@oetzilabs-plaaaner-com/core/src/entities/tickets";
import { Workspace } from "@oetzilabs-plaaaner-com/core/src/entities/workspaces";
import { action, cache, redirect, revalidate } from "@solidjs/router";
import dayjs from "dayjs";
import isoWeek from "dayjs/plugin/isoWeek";
import updateLocale from "dayjs/plugin/updateLocale";
import { getCookie, getEvent } from "vinxi/http";
import { z } from "zod";
import { CreatePlanFormSchema } from "../../utils/schemas/plan";
import { lucia } from "../auth";
import { getLocaleSettings } from "./locale";
import { getActivities } from "./activity";
import { DEFAULT_PLAN_TYPES } from "../../../../core/src/entities/plan_types";

dayjs.extend(isoWeek);
dayjs.extend(updateLocale);

export const getPreviousPlans = cache(async () => {
  "use server";
  const event = getEvent()!;

  const sessionId = getCookie(event, lucia.sessionCookieName) ?? null;

  if (!sessionId) {
    throw redirect("/auth/login");
  }

  const { session, user } = await lucia.validateSession(sessionId);
  if (!session) {
    throw redirect("/auth/login");
  }

  if (!session.organization_id) {
    throw redirect("/setup/organization");
  }
  const plans = await Plans.findByOrganizationId(session.organization_id, { fromDate: null });
  return plans;
}, "previousPlans");

export const getPlans = cache(async (data: { fromDate: Date | null }) => {
  "use server";
  const event = getEvent()!;
  const locale = getLocaleSettings(event);
  dayjs.updateLocale(locale.language, {});

  const user = event.context.user;
  if (!user) {
    throw redirect("/auth/login");
  }

  const session = event.context.session;
  if (!session) {
    throw redirect("/auth/login");
  }

  const plans = await Plans.findBy({
    user_id: user.id,
    workspace_id: session.workspace_id,
    organization_id: session.organization_id,
    fromDate: data.fromDate,
  });
  return plans;
}, "activities");

export const getPlan = cache(async (id: string) => {
  "use server";
  const event = getEvent()!;
  const locale = getLocaleSettings(event);
  dayjs.updateLocale(locale.language, {});

  const user = event.context.user;
  if (!user) {
    throw redirect("/auth/login");
  }

  const session = event.context.session;
  if (!session) {
    throw redirect("/auth/login");
  }

  const plan = await Plans.findById(id);

  if (!plan) {
    throw new Error("This plan does not exist");
  }

  // check if the plan is in the user's workspace
  if (!plan.workspaces.some((ws) => ws.workspace_id === session.workspace_id)) {
    throw new Error("You do not have permission to view this plan");
  }
  return plan;
}, "plan");

export const getRecommendedPlans = cache(async () => {
  "use server";
  const event = getEvent()!;

  const sessionId = getCookie(event, lucia.sessionCookieName) ?? null;

  if (!sessionId) {
    throw redirect("/auth/login");
  }

  const { session, user } = await lucia.validateSession(sessionId);
  if (!session) {
    throw redirect("/auth/login");
  }

  if (!session.organization_id) {
    throw redirect("/setup/organization");
  }
  const plans = await Plans.recommendNewPlans(session.organization_id);
  return plans;
}, "recommendNewPlans");

export const getNearbyPlans = cache(async () => {
  "use server";
  const event = getEvent()!;

  const sessionId = getCookie(event, lucia.sessionCookieName) ?? null;

  if (!sessionId) {
    throw redirect("/auth/login");
  }

  const { session, user } = await lucia.validateSession(sessionId);
  if (!session) {
    throw redirect("/auth/login");
  }

  // @ts-ignore
  const ip = event.node.req.client._peername.address;

  if (!ip) {
    return [];
  }

  if (["127.0.0.1", "::1"].includes(ip)) {
    return [
      {
        id: "test",
        url: "/plans/test",
        name: "test",
        description: "test event for localhost",
        type: "event",
      },
      {
        id: "test-2",
        url: "/plans/test-2",
        name: "test-2",
        description: "test event 2 for localhost",
        type: "custom",
      },
    ];
  }

  const location = await fetch(`http://ip-api.com/json/${ip}`)
    .then((res) => res.json())
    .then((data) =>
      z
        .object({
          lat: z.number(),
          lng: z.number(),
        })
        .parse(data)
    );

  console.log({ location });

  const plans = await Plans.nearbyPlans(location);
  return plans;
}, "nearbyPlans");

export const getDefaultFreeTicketType = cache(async () => {
  "use server";
  const defaultFreeTicketType = await TicketTypes.getDefaultFreeTicketType();

  return defaultFreeTicketType;
}, "default_free_ticket_type");

export const getPlanTypeId = cache(async (plan_type: string) => {
  "use server";
  const plan_type_ = await Plans.getTypeId(plan_type);

  return plan_type_?.id ?? null;
}, "plan_type_id");

export const commentOnPlan = action(async (data: { planId: string; comment: string }) => {
  "use server";
  const event = getEvent()!;

  const sessionId = getCookie(event, lucia.sessionCookieName) ?? null;

  if (!sessionId) {
    throw redirect("/auth/login");
  }

  const { session, user } = await lucia.validateSession(sessionId);
  if (!session) {
    throw redirect("/auth/login");
  }
  if (!user) {
    throw redirect("/auth/login");
  }
  const commented = await Plans.addComment(data.planId, user.id, data.comment);
  await revalidate(getPlanComments.keyFor(commented.planId), true);
  await revalidate(getActivities.key, true);
  return true;
});

export const getPlanComments = cache(async (plan_id) => {
  "use server";
  const event = getEvent()!;

  const sessionId = getCookie(event, lucia.sessionCookieName) ?? null;

  if (!sessionId) {
    throw redirect("/auth/login");
  }

  const { session, user } = await lucia.validateSession(sessionId);
  if (!session) {
    throw redirect("/auth/login");
  }
  if (!user) {
    throw redirect("/auth/login");
  }
  const plan = await Plans.findById(plan_id);
  if (!plan) {
    throw new Error("This plan does not exist");
  }
  return plan.comments;
}, "activities");

export const deletePlanComment = action(async (comment_id) => {
  "use server";
  const event = getEvent()!;

  const sessionId = getCookie(event, lucia.sessionCookieName) ?? null;

  if (!sessionId) {
    throw redirect("/auth/login");
  }

  const { session, user } = await lucia.validateSession(sessionId);
  if (!session) {
    throw redirect("/auth/login");
  }

  if (!user) {
    throw redirect("/auth/login");
  }
  const comment = await Plans.findComment(comment_id);

  if (!comment) {
    throw new Error("This Comment does not exist");
  }

  const removed = await Plans.deleteComment(comment.id);
  if (removed) {
    await revalidate(getPlanComments.keyFor(removed.planId), true);
    await revalidate(getActivities.key, true);
  }

  return removed;
});

export const getUpcomingThreePlans = cache(async () => {
  "use server";
  const event = getEvent()!;
  const locale = getLocaleSettings(event);
  dayjs.updateLocale(locale.language, {});

  const user = event.context.user;
  if (!user) {
    throw redirect("/auth/login");
  }

  const session = event.context.session;
  if (!session) {
    throw redirect("/auth/login");
  }
  const fromDate = dayjs().startOf("day").toDate();
  const plans = await Plans.findBy({
    user_id: user.id,
    workspace_id: session.workspace_id,
    organization_id: session.organization_id,
    fromDate: null,
  });
  const filtered = plans.filter((p) => {
    // take plans that are after or on the same day as the fromDate
    if (fromDate) {
      return dayjs(p.starts_at).isAfter(fromDate) || dayjs(p.starts_at).isSame(fromDate, "day");
    }
    return false;
  });
  const sorted = filtered.sort((a, b) => {
    return dayjs(a.starts_at).isBefore(dayjs(b.starts_at)) ? -1 : 1;
  });
  return sorted.slice(0, 3);
}, "upcomingPlans");

export const deletePlan = action(async (plan_id) => {
  "use server";
  const event = getEvent()!;

  const sessionId = getCookie(event, lucia.sessionCookieName) ?? null;

  if (!sessionId) {
    throw redirect("/auth/login");
  }

  const { session, user } = await lucia.validateSession(sessionId);
  if (!session) {
    throw redirect("/auth/login");
  }

  if (!user) {
    throw redirect("/auth/login");
  }
  const plan = await Plans.findById(plan_id);

  if (!plan) {
    throw new Error("This Plan does not exist");
  }

  if (plan.deletedAt) {
    throw new Error("This Plan has already been deleted");
  }

  if (plan.owner.id !== user.id) {
    throw new Error("You do not have permission to delete this Plan");
  }

  const removed = await Plans.update({ id: plan.id, deletedAt: new Date() });

  await revalidate(getActivities.key, true);
  await revalidate(getUpcomingThreePlans.key, true);

  const removedPlan = await Plans.findById(removed.id);

  return removedPlan;
});

export const savePlanGeneral = action(
  async (data: {
    plan_id: string;
    plan: {
      name: string;
      description: string;
    };
  }) => {
    "use server";
    const event = getEvent()!;
    console.log(data);

    const sessionId = getCookie(event, lucia.sessionCookieName) ?? null;

    if (!sessionId) {
      throw redirect("/auth/login");
    }

    const { session, user } = await lucia.validateSession(sessionId);
    if (!session) {
      throw redirect("/auth/login");
    }

    if (!session.organization_id) {
      throw redirect("/setup/organization");
    }
    const workspaceId = session.workspace_id;

    if (!workspaceId) {
      throw redirect("/workspaces/new");
    }
    const workspace = await Workspace.findById(workspaceId);

    if (!workspace) {
      throw redirect("/workspaces/new");
    }
    const plan = await Plans.findById(data.plan_id);
    if (!plan) {
      throw new Error("This plan does not exist");
    }

    const savedPlan = await Plans.update({
      id: plan.id,
      name: data.plan.name,
      description: data.plan.description,
    });

    const updatedPlan = await Plans.findById(savedPlan.id);
    if (!updatedPlan) {
      throw new Error("This plan does not exist anymore");
    }

    await revalidate(getActivities.key, true);
    await revalidate(getUpcomingThreePlans.key, true);

    return updatedPlan;
  }
);

export const savePlanTimeslots = action(
  async (data: {
    plan_id: string;
    plan: {
      days: [Date, Date];
      time_slots: Record<
        string,
        Record<
          string,
          {
            start: Date;
            end: Date;
          }
        >
      >;
    };
  }) => {
    "use server";
    const event = getEvent()!;

    const sessionId = getCookie(event, lucia.sessionCookieName) ?? null;

    if (!sessionId) {
      throw redirect("/auth/login");
    }

    const { session, user } = await lucia.validateSession(sessionId);
    if (!session) {
      throw redirect("/auth/login");
    }

    if (!session.organization_id) {
      throw redirect("/setup/organization");
    }
    const workspaceId = session.workspace_id;

    if (!workspaceId) {
      throw redirect("/workspaces/new");
    }
    const workspace = await Workspace.findById(workspaceId);

    if (!workspace) {
      throw redirect("/workspaces/new");
    }
    const plan = await Plans.findById(data.plan_id);
    if (!plan) {
      throw new Error("This plan does not exist");
    }
    const [starts_at, ends_at] = data.plan.days;

    const savedPlan = await Plans.update({
      id: plan.id,
      starts_at,
      ends_at,
    });

    const time_slots = data.plan.time_slots;

    const timeSlotsObject = Object.values(time_slots);
    type TS = z.infer<typeof PlanTimesCreateSchema>;

    const tss = timeSlotsObject.map((tso) =>
      Object.values(tso).map(
        (ts) =>
          ({
            starts_at: ts.start,
            ends_at: ts.end,
            plan_id: savedPlan.id,
          } as TS)
      )
    );

    const timeSlots = tss.flat();

    await Plans.createTimeSlots(timeSlots, user.id);

    const updatedPlan = await Plans.findById(savedPlan.id);
    if (!updatedPlan) {
      throw new Error("This plan does not exist anymore");
    }

    await revalidate(getActivities.key, true);
    await revalidate(getUpcomingThreePlans.key, true);

    return updatedPlan;
  }
);

export const createPlanCreationForm = action(async (data: { title: string; description: string }) => {
  "use server";
  const event = getEvent()!;
  const locale = getLocaleSettings(event);
  dayjs.updateLocale(locale.language, {});

  const user = event.context.user;
  if (!user) {
    throw redirect("/auth/login");
  }

  const session = event.context.session;
  if (!session) {
    throw redirect("/auth/login");
  }

  if (!session.organization_id) {
    throw redirect("/setup/organization");
  }
  const workspaceId = session.workspace_id;
  if (!workspaceId) {
    throw new Error("No workspace selected");
  }

  const [plan] = await Plans.create(
    {
      name: data.title,
      description: data.description,
      plan_type_id: null,
      starts_at: dayjs().startOf("day").toDate(),
      ends_at: dayjs().endOf("day").toDate(),
      status: "draft",
    },
    user.id,
    workspaceId
  );

  return plan;
});
