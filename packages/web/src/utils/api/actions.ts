import { lucia } from "@/lib/auth";
import { getAuthenticatedSession } from "@/lib/auth/util";
import { Organization } from "@oetzilabs-plaaaner-com/core/src/entities/organizations";
import { action, redirect, reload } from "@solidjs/router";
import { appendHeader, getCookie, getEvent } from "vinxi/http";
import { z } from "zod";
import { getContext } from "../../lib/auth/context";

export const logout = action(async () => {
  "use server";
  const [ctx, event] = await getContext();
  if (!ctx) throw redirect("/auth/login");
  if (!ctx.session) throw redirect("/auth/login");
  if (!ctx.user) throw redirect("/auth/login");
  await lucia.invalidateSession(ctx.session.id);
  appendHeader(event, "Set-Cookie", lucia.createBlankSessionCookie().serialize());
  event.context.session = null;

  throw reload({ headers: { Location: "/auth/login" }, status: 303, revalidate: getAuthenticatedSession.key });
});

export const revokeAllSessions = action(async () => {
  "use server";
  const [ctx, event] = await getContext();
  if (!ctx) throw redirect("/auth/login");
  if (!ctx.session) throw redirect("/auth/login");
  if (!ctx.user) throw redirect("/auth/login");
  await lucia.invalidateUserSessions(ctx.user.id);
  reload({ headers: { Location: "/auth/login" }, status: 303, revalidate: getAuthenticatedSession.key });
});

export const revokeSession = action(async (session_id: string) => {
  "use server";
  const [ctx, event] = await getContext();
  if (!ctx) throw redirect("/auth/login");
  if (!ctx.session) throw redirect("/auth/login");
  if (!ctx.user) throw redirect("/auth/login");

  await lucia.invalidateSession(session_id);

  return true;
});

export const changeNotificationSettings = action(async (type: string) => {
  "use server";
  const [ctx, event] = await getContext();
  if (!ctx) throw redirect("/auth/login");
  if (!ctx.session) throw redirect("/auth/login");
  if (!ctx.user) throw redirect("/auth/login");

  return { type };
});

export const changeMessageSettings = action(async (type: string) => {
  "use server";
  const [ctx, event] = await getContext();
  if (!ctx) throw redirect("/auth/login");
  if (!ctx.session) throw redirect("/auth/login");
  if (!ctx.user) throw redirect("/auth/login");

  return { type };
});

export const disconnectFromOrganization = action(async (org_id: string) => {
  "use server";
  const [ctx, event] = await getContext();
  if (!ctx) throw redirect("/auth/login");
  if (!ctx.session) throw redirect("/auth/login");
  if (!ctx.user) throw redirect("/auth/login");

  const o = await Organization.disconnectUser(org_id, ctx.user.id);
  await lucia.invalidateSession(ctx.session.id);
  const new_session = await lucia.createSession(
    ctx.user.id,
    {
      access_token: ctx.session.access_token,
      organization_id: null,
      workspace_id: null,
      createdAt: new Date(),
    },
    {
      sessionId: ctx.session.id,
    },
  );
  appendHeader(event, "Set-Cookie", lucia.createSessionCookie(new_session.id).serialize());
  event.context.session = new_session;
  return o;
});

export const deleteOrganization = action(async (id: string) => {
  "use server";
  const [ctx, event] = await getContext();
  if (!ctx) throw redirect("/auth/login");
  if (!ctx.session) throw redirect("/auth/login");
  if (!ctx.user) throw redirect("/auth/login");

  const o = await Organization.markAsDeleted({ id });
  await lucia.invalidateSession(ctx.session.id);
  const new_session = await lucia.createSession(
    ctx.user.id,
    {
      access_token: ctx.session.access_token,
      organization_id: null,
      workspace_id: null,
      createdAt: new Date(),
    },
    {
      sessionId: ctx.session.id,
    },
  );
  appendHeader(event, "Set-Cookie", lucia.createSessionCookie(new_session.id).serialize());
  event.context.session = new_session;

  return o;
});

export const setOrganizationOwner = action(async (id: string) => {
  "use server";
  const [ctx, event] = await getContext();
  if (!ctx) throw redirect("/auth/login");
  if (!ctx.session) throw redirect("/auth/login");
  if (!ctx.user) throw redirect("/auth/login");

  const o = await Organization.setOwner(id, ctx.user.id);

  return o;
});
