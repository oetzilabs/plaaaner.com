import { lucia } from "@/lib/auth";
import { Organization } from "@oetzilabs-plaaaner-com/core/src/entities/organizations";
import { action, redirect, revalidate } from "@solidjs/router";
import { appendHeader, getCookie } from "vinxi/http";
import { z } from "zod";
import { getEvent } from "vinxi/http";
import { getAuthenticatedSession } from "@/lib/auth/util";
import { getNotificationSettings } from "../../lib/api/notifications";
import { getMessagingSettings } from "../../lib/api/messages";

export const logout = action(async () => {
  "use server";
  const event = getEvent()!;
  if (!event.context.session) {
    return new Error("Unauthorized");
  }
  await lucia.invalidateSession(event.context.session.id);
  appendHeader(event, "Set-Cookie", lucia.createBlankSessionCookie().serialize());
  event.context.session = null;

  await revalidate(getAuthenticatedSession.key, true);
  throw redirect("/auth/login", 303);
});

export const revokeAllSessions = action(async () => {
  "use server";
  const event = getEvent()!;
  if (!event.context.user) {
    console.log("Unauthorized");
    return false;
  }
  const { id } = event.context.user;
  await lucia.invalidateUserSessions(id);
  await revalidate(getAuthenticatedSession.key, true);

  return true;
});

export const revokeSession = action(async (data: FormData) => {
  "use server";
  const event = getEvent()!;

  const sessionId = getCookie(event, lucia.sessionCookieName) ?? null;
  if (!event.context.user) {
    console.log("Unauthorized");
    return false;
  }

  const d = Object.fromEntries(data.entries());
  const validation = z
    .object({
      session_id: z.string(),
    })
    .safeParse(d);

  if (!validation.success) {
    throw validation.error;
  }
  await lucia.invalidateSession(validation.data.session_id);
  await revalidate(getAuthenticatedSession.key, true);

  return true;
});

export const changeNotificationSettings = action(async (type: string) => {
  "use server";
  const event = getEvent()!;
  if (!event.context.user) {
    return new Error("Unauthorized");
  }

  await revalidate(getNotificationSettings.key, true);
  return { type };
});

export const changeMessageSettings = action(async (type: string) => {
  "use server";
  const event = getEvent()!;
  if (!event.context.user) {
    return new Error("Unauthorized");
  }
  await revalidate(getMessagingSettings.key, true);
  return { type };
});

export const disconnectFromOrganization = action(async (data: string) => {
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
  const valid = z.string().uuid().safeParse(data);
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
      createdAt: new Date(),
    },
    {
      sessionId: sessionId,
    }
  );
  appendHeader(event, "Set-Cookie", lucia.createSessionCookie(new_session.id).serialize());
  event.context.session = session;
  await revalidate(getAuthenticatedSession.key, true);
  return o;
});

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
      createdAt: new Date(),
    },
    {
      sessionId: sessionId,
    }
  );
  appendHeader(event, "Set-Cookie", lucia.createSessionCookie(new_session.id).serialize());
  event.context.session = session;
  await revalidate(getAuthenticatedSession.key, true);

  return o;
});

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
  await revalidate(getAuthenticatedSession.key, true);

  return o;
});
