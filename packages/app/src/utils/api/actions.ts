import { lucia } from "@/lib/auth";
import { Organization } from "@oetzilabs-plaaaner-com/core/src/entities/organizations";
import { action, redirect } from "@solidjs/router";
import { appendHeader, getCookie } from "vinxi/http";
import { z } from "zod";
import { getEvent } from "vinxi/http";

export const logout = action(async () => {
  "use server";
  const event = getEvent()!;
  if (!event.context.session) {
    return new Error("Unauthorized");
  }
  await lucia.invalidateSession(event.context.session.id);
  appendHeader(event, "Set-Cookie", lucia.createBlankSessionCookie().serialize());
  event.context.session = null;
  throw redirect("/auth/login", 303);
}, "session");

export const revokeAllSessions = action(async () => {
  "use server";
  const event = getEvent()!;
  if (!event.context.user) {
    console.log("Unauthorized");
    return false;
  }
  const { id } = event.context.user;
  await lucia.invalidateUserSessions(id);

  return true;
}, "sessions");

export const revokeSession = action(async(data:FormData) => {
  "use server";
  const event = getEvent()!;

  const sessionId = getCookie(event, lucia.sessionCookieName) ?? null;
  if (!event.context.user) {
    console.log("Unauthorized");
    return false;
  }

  const d = Object.fromEntries(data.entries());
  const validation = z.object({
    session_id: z.string(),
  }).safeParse(d);

  if(!validation.success) {
    throw validation.error;
  }
  await lucia.invalidateSession(validation.data.session_id);

  return true;

});

export const changeNotificationSettings = action(async (type: string) => {
  "use server";
  const event = getEvent()!;
  if (!event.context.user) {
    return new Error("Unauthorized");
  }
  return { type };
}, "notificationSettings");

export const changeMessageSettings = action(async (type: string) => {
  "use server";
  const event = getEvent()!;
  if (!event.context.user) {
    return new Error("Unauthorized");
  }
  return { type };
}, "messageSetting");

export const disconnectFromOrganization = action(async (data: FormData) => {
  "use server";
  const event = getEvent()!;
  const sessionId = getCookie(event, lucia.sessionCookieName) ?? null;

  if (!sessionId) {
    throw redirect("/auth/login");
  }

  const { session, user } = await lucia.validateSession(sessionId);
  if (!session || !user) {
    throw redirect("/auth/login");
  }
  const valid = z.string().uuid().safeParse(data.get("organizationId"));
  if (!valid.success) {
    throw new Error("Invalid data");
  }
  const organizationId = valid.data;
  const o = await Organization.disconnectUser(organizationId, user.id);
  await lucia.invalidateSession(sessionId);
  const new_session = await lucia.createSession(
    user.id,
    {
      access_token: session.access_token,
      organization_id: null,
      workspace_id: null,
    },
    {
      sessionId: sessionId,
    }
  );
  appendHeader(event, "Set-Cookie", lucia.createSessionCookie(new_session.id).serialize());
  event.context.session = session;
  return o;
}, "session");

export const deleteOrganization = action(async (id: string) => {
  "use server";
  const event = getEvent()!;
  const sessionId = getCookie(event, lucia.sessionCookieName) ?? null;

  if (!sessionId) {
    throw redirect("/auth/login");
  }

  const { session, user } = await lucia.validateSession(sessionId);
  if (!session || !user) {
    throw redirect("/auth/login");
  }
  const valid = z.string().uuid().safeParse(id);
  if (!valid.success) {
    throw new Error("Invalid data");
  }
  const organizationId = valid.data;
  const o = await Organization.markAsDeleted({ id: organizationId });
  await lucia.invalidateSession(sessionId);
  const new_session = await lucia.createSession(
    user.id,
    {
      access_token: session.access_token,
      organization_id: null,
      workspace_id: null,
    },
    {
      sessionId: sessionId,
    }
  );
  appendHeader(event, "Set-Cookie", lucia.createSessionCookie(new_session.id).serialize());
  event.context.session = session;

  return o;
}, "session");

export const setOrganizationOwner = action(async (id: string) => {
  "use server";
  const event = getEvent()!;
  if (!event.context.user) {
    return new Error("Unauthorized");
  }
  const valid = z.string().uuid().safeParse(id);
  if (!valid.success) {
    return new Error("Invalid data");
  }
  const organizationId = valid.data;
  const o = await Organization.setOwner(organizationId, event.context.user.id);

  return o;
});
