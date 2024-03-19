import { cache, redirect } from "@solidjs/router";
import { lucia } from ".";
import { getCookie, getEvent } from "vinxi/http";
import { Organization } from "@oetzilabs-plaaaner-com/core/src/entities/organizations";
import { User } from "@oetzilabs-plaaaner-com/core/src/entities/users";
import { Workspace } from "@oetzilabs-plaaaner-com/core/src/entities/workspaces";

export const getAuthenticatedUser = cache(async () => {
  "use server";
  const event = getEvent()!;
  if (!event.context.session) {
    return null;
  }
  const { id } = event.context.session;
  const { user } = await lucia.validateSession(id);
  return user;
}, "user");

export type UserSession = {
  id: string | null;
  token: string | null;
  expiresAt: Date | null;
  user: Awaited<ReturnType<typeof User.findById>> | null;
  organization: Awaited<ReturnType<typeof Organization.findById>> | null;
  workspace: Awaited<ReturnType<typeof Workspace.findById>> | null;
};

export const getAuthenticatedSession = cache(async () => {
  "use server";
  let userSession = {
    id: null,
    token: null,
    expiresAt: null,
    user: null,
    organization: null,
    workspace: null,
  } as UserSession;
  const event = getEvent()!;
  const sessionId = getCookie(event, lucia.sessionCookieName) ?? null;
  if (!sessionId) {
    // throw redirect("/auth/login");
    return userSession;
  }
  // console.log({ sessionId });
  const { session } = await lucia.validateSession(sessionId);
  if (!session) {
    // throw redirect("/auth/login");
    return userSession;
  }

  userSession.id = session.id;
  if (session.organization_id) userSession.organization = await Organization.findById(session.organization_id);
  if (session.workspace_id) userSession.workspace = await Workspace.findById(session.workspace_id);
  if (session.userId) userSession.user = await User.findById(session.userId);

  return userSession;
}, "session");

export const getAuthenticatedSessions = cache(async () => {
  "use server";
  const event = getEvent()!;
  if (!event.context.user) {
    return redirect("/auth/login");
  }
  const { id } = event.context.user;
  const sessions = await lucia.getUserSessions(id);
  return sessions;
}, "sessions");

export const getCurrentOrganization = cache(async () => {
  "use server";
  const event = getEvent()!;

  if (!event.context.session) {
    return redirect("/auth/login");
  }

  const { id } = event.context.session;

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
  const event = getEvent()!;

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
