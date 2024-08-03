import { prefixed_cuid2 } from "@oetzilabs-plaaaner-com/core/src/custom_cuid2";
import { Organization } from "@oetzilabs-plaaaner-com/core/src/entities/organizations";
import { TicketTypes } from "@oetzilabs-plaaaner-com/core/src/entities/ticket_types";
import { action, cache, redirect } from "@solidjs/router";
import { appendHeader, getCookie, getEvent } from "vinxi/http";
import { z } from "zod";
import { lucia } from "../auth";
import { getContext } from "../auth/context";

export const createOrganization = action(async (form: FormData) => {
  "use server";
  const [ctx, event] = await getContext();
  if (!ctx) throw redirect("/auth/login");
  if (!ctx.session) throw redirect("/auth/login");
  if (!ctx.user) throw redirect("/auth/login");

  // @ts-expect-error
  const data = Object.fromEntries(form.entries());

  const validation = Organization.safeParseCreate(data);

  if (!validation.success) {
    throw validation.error;
  }

  if (validation.data.name.length === 0) {
    throw new Error("Organization name is too short. Please set a name");
  }

  const organization = await Organization.create(validation.data, ctx.user.id);

  if (!organization) {
    throw new Error("Couldn't create organization");
  }

  const connected = await Organization.connectUser(organization.id, ctx.user.id);

  if (!connected) {
    throw new Error("Couldn't connect user to organization");
  }

  await lucia.invalidateSession(ctx.session.id);

  const session = await lucia.createSession(
    ctx.user.id,
    {
      access_token: ctx.session.access_token,
      workspace_id: ctx.session.workspace_id,
      organization_id: organization.id,
      createdAt: new Date(),
    },
    {
      sessionId: ctx.session.id,
    },
  );

  appendHeader(event, "Set-Cookie", lucia.createSessionCookie(session.id).serialize());
  event.context.session = session;

  return redirect("/dashboard");
});

export const getUserOrganizations = cache(async () => {
  "use server";
  const [ctx, event] = await getContext();
  if (!ctx) throw redirect("/auth/login");
  if (!ctx.session) throw redirect("/auth/login");
  if (!ctx.user) throw redirect("/auth/login");

  const orgs = await Organization.findManyByUserId(ctx.user.id);

  return orgs;
}, "user-organizations");

export const getOrganizationById = cache(async (id: string) => {
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

  const organization = await Organization.findById(id);
  if (!organization) {
    console.error("Organization not found");
    throw redirect("/404", 404);
  }

  const isUserInOrg = await Organization.hasUser(organization.id, user.id);
  if (!isUserInOrg) {
    console.error("User is not in organization");
    throw redirect("/403", 403);
  }

  return organization;
}, "organization-by-id");

export const getOrganization = cache(async () => {
  "use server";
  const [ctx, event] = await getContext();
  if (!ctx) throw redirect("/auth/login");
  if (!ctx.session) throw redirect("/auth/login");

  if (!ctx.session.organization_id) {
    return null;
  }

  const organizations = await Organization.findById(ctx.session.organization_id);

  return organizations;
}, "organization");

export const requestOrganizationJoin = action(async (form: FormData) => {
  "use server";
  const [ctx, event] = await getContext();
  if (!ctx) throw redirect("/auth/login");
  if (!ctx.session) throw redirect("/auth/login");
  if (!ctx.user) throw redirect("/auth/login");

  // @ts-expect-error
  const data = Object.fromEntries(form.entries());

  const validation = z
    .object({
      organization_id: prefixed_cuid2,
    })
    .safeParse(data);

  if (!validation.success) {
    console.error(validation.error);
    throw validation.error;
  }

  if (ctx.session.organization_id !== null && ctx.session.organization_id === validation.data.organization_id) {
    // user is already connected to the organization
    throw redirect("/dashboard");
  }

  const organization = await Organization.findById(validation.data.organization_id);

  if (!organization) {
    throw new Error("Organization does not exist");
  }

  const organizationJoin = await Organization.requestJoin(organization.id, ctx.user.id);

  console.log("Requested to join:", organizationJoin);

  return organizationJoin;
});

export const getAllOrganizations = cache(async () => {
  "use server";
  const orgs = await Organization.all();
  return orgs;
}, "all-organizations");

export const getNoneConnectedOrganizations = cache(async () => {
  "use server";
  const [ctx, event] = await getContext();
  if (!ctx) throw redirect("/auth/login");
  if (!ctx.session) throw redirect("/auth/login");
  if (!ctx.user) throw redirect("/auth/login");
  const orgs = await Organization.notConnectedToUserById(ctx.user.id);
  return orgs;
}, "none-connected-organizations");

export const getTicketTypes = cache(async () => {
  "use server";
  const [ctx, event] = await getContext();
  if (!ctx) throw redirect("/auth/login");
  if (!ctx.session) throw redirect("/auth/login");
  if (!ctx.user) throw redirect("/auth/login");

  if (!ctx.session.organization_id) {
    return [] as Awaited<ReturnType<typeof Organization.getTicketTypesByOrganization>>;
  }

  const org_ticket_types = await Organization.getTicketTypesByOrganization(ctx.session.organization_id);

  return org_ticket_types;
}, "organization-ticket-types");

export const fillDefaultTicketTypes = action(async () => {
  "use server";
  const [ctx, event] = await getContext();
  if (!ctx) throw redirect("/auth/login");
  if (!ctx.session) throw redirect("/auth/login");
  if (!ctx.user) throw redirect("/auth/login");

  if (!ctx.session.organization_id) {
    return [] as Awaited<ReturnType<typeof Organization.fillDefaultTicketTypes>>;
  }

  const org_ticket_types = await Organization.fillDefaultTicketTypes(ctx.session.organization_id);

  return org_ticket_types;
});

export const getDefaultTicketTypeCount = cache(async () => {
  "use server";
  const [ctx, event] = await getContext();
  if (!ctx) throw redirect("/auth/login");
  if (!ctx.session) throw redirect("/auth/login");
  if (!ctx.user) throw redirect("/auth/login");

  if (!ctx.session.organization_id) {
    return 0;
  }

  const org_ticket_types = await TicketTypes.getDefaultCount();

  return org_ticket_types;
}, "organization-ticket-types-count");
