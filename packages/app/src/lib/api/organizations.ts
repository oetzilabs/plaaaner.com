import { Organization } from "@oetzilabs-plaaaner-com/core/src/entities/organizations";
import { TicketTypes } from "@oetzilabs-plaaaner-com/core/src/entities/ticket_types";
import { action, cache, redirect } from "@solidjs/router";
import { getRequestEvent } from "solid-js/web";
import { appendHeader, getCookie } from "vinxi/http";
import { z } from "zod";
import { lucia } from "../auth";

export const createOrganization = action(async (form: FormData) => {
  "use server";
  const event = getRequestEvent()!;

  const sessionId = getCookie(event, lucia.sessionCookieName) ?? null;

  if (!sessionId) {
    return new Error("Unauthorized");
  }

  const { session: currentSession, user } = await lucia.validateSession(sessionId);

  if (!user) {
    throw redirect("/auth/login");
  }

  const data = Object.fromEntries(form.entries());

  const validation = Organization.safeParseCreate(data);

  if (!validation.success) {
    throw validation.error;
  }

  if (validation.data.name.length === 0) {
    throw new Error("Organization name is too short. Please set a name");
  }

  const organization = await Organization.create(validation.data, user.id);

  if (!organization) {
    throw new Error("Couldn't create organization");
  }

  const connected = await Organization.connectUser(organization.id, user.id);

  if (!connected) {
    throw new Error("Couldn't connect user to organization");
  }

  if (!currentSession || !user) {
    throw new Error("Unauthorized");
  }

  await lucia.invalidateSession(sessionId);

  const session = await lucia.createSession(
    user.id,
    {
      access_token: currentSession.access_token,
      workspace_id: currentSession.workspace_id,
      organization_id: organization.id,
    },
    {
      sessionId: sessionId,
    }
  );

  appendHeader(event, "Set-Cookie", lucia.createSessionCookie(session.id).serialize());
  event.nativeEvent.context.session = session;

  return redirect("/dashboard");
}, "currentOrganization");

export const getOrganizations = cache(async () => {
  "use server";
  const event = getRequestEvent()!;

  if (!event.nativeEvent.context.user) {
    throw redirect("/auth/login");
  }

  const user = event.nativeEvent.context.user;

  const o = await Organization.findManyByUserId(user.id);

  return o;
}, "organizations");

export const getOrganization = cache(async () => {
  "use server";
  const event = getRequestEvent()!;

  const sessionId = getCookie(event, lucia.sessionCookieName) ?? null;

  if (!sessionId) {
    return new Error("Unauthorized");
  }

  const { session } = await lucia.validateSession(sessionId);

  if (!session) {
    throw redirect("/auth/login");
  }

  if (!session.organization_id) {
    return null;
  }

  const organizations = await Organization.findById(session.organization_id);

  return organizations;
}, "organization");

export const requestOrganizationJoin = action(async (form: FormData) => {
  "use server";
  const event = getRequestEvent()!;

  const sessionId = getCookie(event, lucia.sessionCookieName) ?? null;

  if (!sessionId) {
    return new Error("Unauthorized");
  }

  const { session, user } = await lucia.validateSession(sessionId);

  if (!user) {
    throw redirect("/auth/login");
  }

  const data = Object.fromEntries(form.entries());

  const validation = z
    .object({
      organization_id: z.string().uuid(),
    })
    .safeParse(data);

  if (!session) {
    throw redirect("/auth/login");
  }

  if (!validation.success) {
    console.error(validation.error);
    throw validation.error;
  }

  if (session.organization_id !== null && session.organization_id === validation.data.organization_id) {
    // user is already connected to the organization
    throw redirect("/dashboard");
  }

  const organization = await Organization.findById(validation.data.organization_id);

  if (!organization) {
    throw new Error("Organization does not exist");
  }

  const organizationJoin = await Organization.requestJoin(organization.id, user.id);

  console.log("Requested to join:", organizationJoin);

  return organizationJoin;
}, "organizations");

export const getAllOrganizations = cache(async () => {
  "use server";
  const orgs = await Organization.all();
  return orgs;
}, "allOrganizations");

export const getNoneConnectedOrganizations = cache(async () => {
  "use server";
  const event = getRequestEvent()!;

  const sessionId = getCookie(event, lucia.sessionCookieName) ?? null;
  if (!sessionId) {
    throw redirect("/auth/login");
  }

  const { user } = await lucia.validateSession(sessionId);

  if (!user) {
    throw redirect("/auth/login");
  }
  const orgs = await Organization.notConnectedToUserById(user.id);
  return orgs;
}, "allOrganizations");

export const getTicketTypes = cache(async () => {
  "use server";
  const event = getRequestEvent()!;

  const sessionId = getCookie(event, lucia.sessionCookieName) ?? null;

  if (!sessionId) {
    throw redirect("/auth/login");
  }

  const { session } = await lucia.validateSession(sessionId);

  if (!session) {
    throw redirect("/auth/login");
  }

  if (!session.organization_id) {
    return [] as Awaited<ReturnType<typeof Organization.getTicketTypesByOrganization>>;
  }

  const org_ticket_types = await Organization.getTicketTypesByOrganization(session.organization_id);

  return org_ticket_types;
}, "organization_ticket_types");

export const fillDefaultTicketTypes = action(async () => {
  "use server";
  const event = getRequestEvent()!;

  const sessionId = getCookie(event, lucia.sessionCookieName) ?? null;

  if (!sessionId) {
    throw redirect("/auth/login");
  }

  const { session } = await lucia.validateSession(sessionId);

  if (!session) {
    throw redirect("/auth/login");
  }

  if (!session.organization_id) {
    return [] as Awaited<ReturnType<typeof Organization.fillDefaultTicketTypes>>;
  }

  const org_ticket_types = await Organization.fillDefaultTicketTypes(session.organization_id);

  return org_ticket_types;
}, "organization_ticket_types");

export const getDefaultTicketTypeCount = cache(async () => {
  "use server";
  const event = getRequestEvent()!;

  const sessionId = getCookie(event, lucia.sessionCookieName) ?? null;

  if (!sessionId) {
    throw redirect("/auth/login");
  }

  const { session } = await lucia.validateSession(sessionId);

  if (!session) {
    throw redirect("/auth/login");
  }

  if (!session.organization_id) {
    return 0;
  }

  const org_ticket_types = await TicketTypes.getDefaultCount();

  return org_ticket_types;
}, "organization_ticket_types_count");
