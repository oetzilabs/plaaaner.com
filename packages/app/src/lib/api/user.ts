import { Organization } from "@oetzilabs-plaaaner-com/core/src/entities/organizations";
import { Workspace } from "@oetzilabs-plaaaner-com/core/src/entities/workspaces";
import { User } from "@oetzilabs-plaaaner-com/core/src/entities/users";
import { action, redirect } from "@solidjs/router";
import { appendHeader, getCookie, getEvent } from "vinxi/http";
import { z } from "zod";
import { lucia } from "../auth";

export const saveUser = action(async (data: FormData) => {
  "use server";
  const event = getEvent()!;
  if (!event.context.user) {
    return new Error("Unauthorized");
  }
  const { id } = event.context.user;
  const data_ = Object.fromEntries(data.entries());
  const d = { id, ...data_ };
  const valid = User.safeParseUpdate(d);
  if (!valid.success) {
    // console.log("valid.error", valid.error);
    return new Error("Invalid data");
  }
  const updatedUser = await User.update(valid.data);
  return updatedUser;
}, "users");

export const loginViaEmail = action(async (email: string) => {
  "use server";
  const event = getEvent()!;
  if (!event.context.user) {
    return new Error("Unauthorized");
  }
  const { id } = event.context.user;
  let user = await User.findByEmail(email);
  if (!user) {
    user = await User.create({ name: email, email });
    // TODO!: Send email to user with magic code, to verify.
  }
  // TODO!: Send email to user with magic code, to verify.
  const session = await lucia.createSession(user.id, {
    access_token: null,
    organization_id: null,
    workspace_id: null,
    createdAt: new Date(),
  });
  appendHeader(event, "Set-Cookie", lucia.createSessionCookie(session.id).serialize());
  event.context.session = session;
  return user;
}, "users");

export const disableUser = action(async () => {
  "use server";
  const event = getEvent()!;
  if (!event.context.user) {
    return new Error("Unauthorized");
  }
  const sessionId = getCookie(event, lucia.sessionCookieName) ?? null;
  if (!sessionId) {
    return new Error("Unauthorized");
  }
  const { session: currentSession, user } = await lucia.validateSession(sessionId);
  if (!currentSession || !user) {
    throw new Error("Unauthorized");
  }
  const { id } = event.context.user;
  await User.markAsDeleted({
    id,
  });
  await lucia.invalidateSession(sessionId);
  appendHeader(event, "Set-Cookie", lucia.createBlankSessionCookie().serialize());
  throw redirect("/");
}, "user");

export const setDashboard = action(async (organization_id: string, workspace_id: string) => {
  "use server";
  const event = getEvent()!;
  if (!event.context.user) {
    throw new Error("Unauthorized");
  }
  const sessionId = getCookie(event, lucia.sessionCookieName) ?? null;
  if (!sessionId) {
    throw new Error("Unauthorized");
  }
  const { session: currentSession, user } = await lucia.validateSession(sessionId);
  if (!currentSession || !user) {
    throw new Error("Unauthorized");
  }
  const validWorkspace = z.string().uuid().safeParse(workspace_id);
  if (!validWorkspace.success) {
    throw new Error("Invalid data");
  }
  const workspaceId = validWorkspace.data;
  const validOrganization = z.string().uuid().safeParse(organization_id);
  if (!validOrganization.success) {
    throw new Error("Invalid data");
  }
  const organizationId = validOrganization.data;
  const o = await Organization.findById(organizationId);
  if (!o) {
    throw new Error("Organization not found");
  }
  const w = await Workspace.findById(workspaceId);
  if (!w) {
    throw new Error("Workspace not found");
  }

  await lucia.invalidateSession(sessionId);
  const session = await lucia.createSession(
    user.id,
    {
      access_token: currentSession.access_token,
      organization_id: o.id,
      workspace_id: w.id,
      createdAt: new Date(),
    },
    {
      sessionId: sessionId,
    }
  );
  // console.log("new session with new workspace_id", session);
  appendHeader(event, "Set-Cookie", lucia.createSessionCookie(session.id).serialize());
  event.context.session = session;
  return o;
}, "session");

export const setCurrentOrganization = action(async (id: string) => {
  "use server";
  const event = getEvent()!;
  if (!event.context.user) {
    return new Error("Unauthorized");
  }
  const sessionId = getCookie(event, lucia.sessionCookieName) ?? null;
  if (!sessionId) {
    return new Error("Unauthorized");
  }
  const { session: currentSession, user } = await lucia.validateSession(sessionId);
  if (!currentSession || !user) {
    throw new Error("Unauthorized");
  }
  const valid = z.string().uuid().safeParse(id);
  if (!valid.success) {
    return new Error("Invalid data");
  }
  const organizationId = valid.data;
  const o = await Organization.findById(organizationId);
  if (!o) {
    return new Error("Organization not found");
  }

  await lucia.invalidateSession(sessionId);
  const session = await lucia.createSession(
    user.id,
    {
      access_token: currentSession.access_token,
      organization_id: o.id,
      workspace_id: null,
      createdAt: new Date(),
    },
    {
      sessionId: sessionId,
    }
  );
  // console.log("new session with new workspace_id", session);
  appendHeader(event, "Set-Cookie", lucia.createSessionCookie(session.id).serialize());
  event.context.session = session;
  return o;
}, "session");
