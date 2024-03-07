import { action, cache, redirect } from "@solidjs/router";
import { Plans } from "@oetzilabs-plaaaner-com/core/src/entities/plans";
import { Tickets } from "@oetzilabs-plaaaner-com/core/src/entities/tickets";
import { TicketTypes } from "@oetzilabs-plaaaner-com/core/src/entities/ticket_types";
import { getCookie } from "vinxi/http";
import { lucia } from "../auth";
import { z } from "zod";
import { CreatePlanFormSchema } from "../../utils/schemas/plan";
import dayjs from "dayjs";
import { getEvent } from "vinxi/http";

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
  const plans = await Plans.findByOrganizationId(session.organization_id);
  return plans;
}, "plans");

export const getPlans = cache(async () => {
  "use server";
  const event = getEvent()!;
  if (!event.context.user) {
    throw redirect("/auth/login");
  }
  const user = event.context.user;
  return [
    {
      id: "1",
      name: "test event",
      type: "event",
      createdAt: dayjs().add(2, "days").toDate(),
      link: "/plans/event/1",
      progress: 60,
      todos: [
        {
          id: "",
          title: "test",
          content: "",
          status: "in-progress" as const,
          participants: [],
          link: "/plans/event/1/todo/1",
        },
      ],
    },
    {
      id: "2",
      name: "test event 2",
      type: "event",
      createdAt: dayjs().add(8, "days").toDate(),
      link: "/plans/event/2",
      progress: 22,
      todos: [
        {
          id: "1",
          title: "test",
          content: "test",
          status: "urgent" as const,
          participants: [],
          link: "/plans/event/2/todo/1",
        },
        {
          id: "2",
          title: "test2",
          content: "test2",
          status: "stale" as const,
          participants: [],
          link: "/plans/event/2/todo/2",
        },
        {
          id: "3",
          title: "test3",
          content: "test3",
          status: "urgent" as const,
          participants: [],
          link: "/plans/event/2/todo/3",
        },
      ],
    },
  ];
  // const n = await Notifications.findManyByUserId(user.id);
  // return n;
}, "plans");

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
}, "plans");

export const createNewPlan = action(async (data: z.infer<typeof CreatePlanFormSchema>) => {
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
  console.log("simulating creating event", data);

  const plan_name = data.name;
  const plan_description = data.description;

  const [start_time, end_time] = data.days;
  const time_slots = data.time_slots;

  const plan_location = data.location;

  const defaultTicketTypeId = await Tickets.getDefaultTypeId();

  const tickets = data.tickets;

  // const e = await Plans.create(validation.data, user.id);

  const e = { id: "test" };

  return e;
}, "plans");

export const getDefaultFreeTicketType = cache(async () => {
  "use server";
  const defaultFreeTicketType = await TicketTypes.getDefaultFreeTicketType();

  return defaultFreeTicketType;
}, "default_free_ticket_type");

export const getPlanTypeId = cache(async (plan_type: z.infer<typeof CreatePlanFormSchema>["plan_type"]) => {
  "use server";
  const plan_type_ = await Plans.getTypeId(plan_type);

  return plan_type_?.id ?? null;
}, "plan_type_id");
