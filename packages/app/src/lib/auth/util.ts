import { cache, redirect } from "@solidjs/router";
import { getRequestEvent } from "solid-js/web";
import { lucia } from ".";
import { appendHeader, getCookie } from "vinxi/http";
import { Organization } from "@oetzilabs-plaaaner-com/core/src/entities/organizations";
import { Workspace } from "@oetzilabs-plaaaner-com/core/src/entities/workspaces";

export const getAuthenticatedUser = cache(async () => {
  "use server";
  const event = getRequestEvent()!;
  if (!event.nativeEvent.context.session) {
    return null;
  }
  const { id } = event.nativeEvent.context.session;
  const { user } = await lucia.validateSession(id);
  return user;
}, "user");

export const getAuthenticatedSession = cache(async () => {
  "use server";
  const event = getRequestEvent()!;
  const sessionId = getCookie(event, lucia.sessionCookieName) ?? null;
  if (!sessionId) {
    return null;
  }
  // console.log({ sessionId });
  const { session, user } = await lucia.validateSession(sessionId);
  // console.log({ session, user });
  return session;
}, "session");

export const getAuthenticatedSessions = cache(async () => {
  "use server";
  const event = getRequestEvent()!;
  if (!event.nativeEvent.context.user) {
    return redirect("/auth/login");
  }
  const { id } = event.nativeEvent.context.user;
  const sessions = await lucia.getUserSessions(id);
  return sessions;
}, "sessions");

export const getCurrentOrganization = cache(async () => {
  "use server";
  const event = getRequestEvent()!;

  if (!event.nativeEvent.context.session) {
    return redirect("/auth/login");
  }

  const { id } = event.nativeEvent.context.session;

  const { user, session } = await lucia.validateSession(id);

  if (!user || !session) {
    throw redirect("/auth/login");
  }

  if (!session.organization_id) {
    throw redirect("/setup/organization");
  }

  const org = Organization.findById(session.organization_id);

  if (!org) {
    throw redirect("/setup/organization");
  }

  return org;
}, "organization");

export const getCurrentWorkspace = cache(async () => {
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

  if (!session.workspace_id) {
    return null;
  }

  const workspace = await Workspace.findById(session.workspace_id);

  return workspace;
}, "workspace");


