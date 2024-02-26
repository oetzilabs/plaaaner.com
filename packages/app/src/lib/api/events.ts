import { action, cache, redirect } from "@solidjs/router";
import { Events } from "@oetzilabs-plaaaner-com/core/src/entities/events";
import { getCookie } from "vinxi/http";
import { lucia } from "../auth";
import { getRequestEvent } from "solid-js/web";
import { z } from "zod";
import { CreateEventFormSchema } from "../../utils/schemas/event";

export const getPreviousEvents = cache(async () => {
  "use server";
  const event = getRequestEvent()!;

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
  const events = await Events.findByOrganizationId(session.organization_id);
  return events;
}, "events");

export const getRecommendedEvents = cache(async () => {
  "use server";
  const event = getRequestEvent()!;

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
  const events = await Events.recommendNewPlans(session.organization_id);
  return events;
}, "events");

export const createNewEvent = action(async (data: z.infer<typeof CreateEventFormSchema>) => {
  "use server";
  const event = getRequestEvent()!;

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

  // const e = await Events.create(validation.data, user.id);

  const e = { id: "test" };

  return e;
}, "events");

export const getEventTypeId = cache(async (event_type: z.infer<typeof CreateEventFormSchema>["event_type"]) => {
  "use server";
  const event_type_ = await Events.getTypeId(event_type);

  return event_type_?.id ?? null;
}, "event_type_id");
