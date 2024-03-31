import { action, cache, redirect } from "@solidjs/router";
import { Plans } from "@oetzilabs-plaaaner-com/core/src/entities/plans";
import { Tickets } from "@oetzilabs-plaaaner-com/core/src/entities/tickets";
import { Workspace } from "@oetzilabs-plaaaner-com/core/src/entities/workspaces";
import { TicketTypes } from "@oetzilabs-plaaaner-com/core/src/entities/ticket_types";
import { getCookie } from "vinxi/http";
import { lucia } from "../auth";
import { z } from "zod";
import { CreatePlanFormSchema } from "../../utils/schemas/plan";
import { getEvent } from "vinxi/http";
import {
  PlanCreateSchema,
  PlanTimesCreateSchema,
  TicketCreateSchema,
} from "@oetzilabs-plaaaner-com/core/src/drizzle/sql/schema";
import dayjs from "dayjs";
import isoWeek from "dayjs/plugin/isoWeek";
import updateLocale from "dayjs/plugin/updateLocale";
import { getLocaleSettings } from "./locale";
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
}, "recommendNewPlans");

export const createNewPlan = action(async (data: z.infer<typeof CreatePlanFormSchema>) => {
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

  const plan_name = data.name;
  const plan_description = data.description;
  const plan_type = await Plans.getTypeId(data.plan_type);
  if (!plan_type) {
    console.log("error: This plan type does not exist, please try again");
    throw new Error("This plan type does not exist, please try again");
  }

  const [starts_at, ends_at] = data.days;
  const time_slots = data.time_slots;

  const plan_location = data.location;

  const tickets = data.tickets;

  const planCreationData: z.infer<typeof PlanCreateSchema> = {
    name: plan_name,
    plan_type_id: plan_type.id,
    description: plan_description,
    ends_at,
    starts_at,
  };

  const validation = PlanCreateSchema.safeParse(planCreationData);
  if (!validation.success) {
    throw new Error("Validation failed", { cause: validation.error.flatten() });
  }

  const [createdPlan] = await Plans.create(validation.data, user.id, workspace.id);

  const ticketCreationData = tickets.map(
    (t) =>
      ({
        name: t.name,
        price: t.price.toFixed(2),
        currency: t.currency.currency_type,
        shape: t.shape,
        plan_id: createdPlan.id,
        quantity: t.quantity,
        ticket_type_id: t.ticket_type.id,
      } as z.infer<typeof TicketCreateSchema>)
  );

  const ticketsValidation = TicketCreateSchema.array().safeParse(ticketCreationData);

  if (!ticketsValidation.success) {
    throw ticketsValidation.error;
  }
  if (ticketsValidation.data.length > 0) {
    const ticketsForPlan = await Tickets.create(ticketsValidation.data, user.id);
    const timeSlotsObject = Object.values(time_slots);
    type TS = z.infer<typeof PlanTimesCreateSchema>;

    const tss = timeSlotsObject.map((tso) =>
      Object.values(tso).map(
        (ts) =>
          ({
            ends_at: ts.end,
            starts_at: ts.start,
            plan_id: createdPlan.id,
          } as TS)
      )
    );

    const timeSlots = tss.flat();

    const planTimesCreated = await Plans.createTimeSlots(timeSlots, user.id);
    console.log({ planTimesCreated, createdPlan, ticketsForPlan });

    // const e = { id: "test" };
  }

  return createdPlan;
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
