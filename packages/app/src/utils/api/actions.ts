import { action, redirect } from "@solidjs/router";
import { getRequestEvent } from "solid-js/web";
import { lucia } from "../../lib/auth";
import { appendHeader, getCookie } from "vinxi/http";
import { User } from "@oetzilabs-plaaaner-com/core/src/entities/users";
import { Workspace } from "@oetzilabs-plaaaner-com/core/src/entities/workspaces";
import { Organization } from "@oetzilabs-plaaaner-com/core/src/entities/organizations";
import { WorkspaceCreateSchema, workspaces } from "@/core/drizzle/sql/schema";
import { z } from "zod";

export const logout = action(async () => {
  "use server";
  const event = getRequestEvent()!;
  if (!event.nativeEvent.context.session) {
    return new Error("Unauthorized");
  }
  await lucia.invalidateSession(event.nativeEvent.context.session.id);
  appendHeader(event, "Set-Cookie", lucia.createBlankSessionCookie().serialize());
  event.nativeEvent.context.session = null;
  throw redirect("/auth/login", 303);
}, "session");

export const saveUser = action(async (data: FormData) => {
  "use server";
  const event = getRequestEvent()!;
  if (!event.nativeEvent.context.user) {
    return new Error("Unauthorized");
  }
  const { id } = event.nativeEvent.context.user;
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

export const disconnectFromWorkspace = action(async (data: FormData) => {
  "use server";
  const event = getRequestEvent()!;
  if (!event.nativeEvent.context.user) {
    return new Error("Unauthorized");
  }
  const { id } = event.nativeEvent.context.user;
  const valid = z.string().uuid().safeParse(data.get("workspaceId"));
  if (!valid.success) {
    return new Error("Invalid data");
  }
  const workspaceId = valid.data;
  const ws = await Workspace.disconnectUser(workspaceId, id);

  return ws;
}, "workspaces");

export const createWorkspace = action(async (data: z.infer<typeof WorkspaceCreateSchema>) => {
  "use server";
  const event = getRequestEvent()!;
  if (!event.nativeEvent.context.user) {
    return new Error("Unauthorized");
  }
  const workspace = await Workspace.create(data);
  await Workspace.connectUser(workspace.id, event.nativeEvent.context.user.id);

  return workspace;
}, "workspaces");

export const deleteWorkspace = action(async (id: string) => {
  "use server";
  const event = getRequestEvent()!;
  if (!event.nativeEvent.context.user) {
    return new Error("Unauthorized");
  }
  const valid = z.string().uuid().safeParse(id);
  if (!valid.success) {
    return new Error("Invalid data");
  }
  const workspaceId = valid.data;
  const ws = await Workspace.markAsDeleted({ id: workspaceId });

  return ws;
}, "workspaces");

export const setWorkspaceOwner = action(async (id: string) => {
  "use server";
  const event = getRequestEvent()!;
  if (!event.nativeEvent.context.user) {
    return new Error("Unauthorized");
  }
  const valid = z.string().uuid().safeParse(id);
  if (!valid.success) {
    return new Error("Invalid data");
  }
  const workspaceId = valid.data;
  const ws = await Workspace.setOwner(workspaceId, event.nativeEvent.context.user.id);

  return ws;
});

export const setCurrentWorkspace = action(async (data: FormData) => {
  "use server";
  const event = getRequestEvent()!;
  if (!event.nativeEvent.context.user) {
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
  const data_ = Object.fromEntries(data.entries());
  const valid = z.string().uuid().safeParse(data_.workspace_id);
  if (!valid.success) {
    return new Error("Invalid data");
  }
  const workspaceId = valid.data;
  const ws = await Workspace.findById(workspaceId);
  if (!ws) {
    return new Error("Workspace not found");
  }

  await lucia.invalidateSession(sessionId);
  const session = await lucia.createSession(
    user.id,
    {
      access_token: currentSession.access_token,
      workspace_id: ws.id,
      organization_id: currentSession.organization_id,
    },
    {
      sessionId: sessionId,
    }
  );
  // console.log("new session with new workspace_id", session);
  appendHeader(event, "Set-Cookie", lucia.createSessionCookie(session.id).serialize());
  event.nativeEvent.context.session = session;
  return ws;
}, "session");

export const revokeAllSessions = action(async () => {
  "use server";
  const event = getRequestEvent()!;
  if (!event.nativeEvent.context.user) {
    console.log("Unauthorized");
    return false;
  }
  const { id } = event.nativeEvent.context.user;
  await lucia.invalidateUserSessions(id);

  return true;
}, "sessions");

export const changeNotificationSettings = action(async (type: string) => {
  "use server";
  const event = getRequestEvent()!;
  if (!event.nativeEvent.context.user) {
    return new Error("Unauthorized");
  }
  return { type };
}, "notificationSettings");

export const changeMessageSettings = action(async (type: string) => {
  "use server";
  const event = getRequestEvent()!;
  if (!event.nativeEvent.context.user) {
    return new Error("Unauthorized");
  }
  return { type };
}, "messageSetting");

export const disconnectFromOrganization = action(async (data: FormData) => {
  "use server";
  const event = getRequestEvent()!;
  if (!event.nativeEvent.context.user) {
    return new Error("Unauthorized");
  }
  const { id } = event.nativeEvent.context.user;
  const valid = z.string().uuid().safeParse(data.get("organizationId"));
  if (!valid.success) {
    return new Error("Invalid data");
  }
  const organizationId = valid.data;
  const o = await Organization.disconnectUser(organizationId, id);

  return o;
}, "organizations");

export const deleteOrganization = action(async (id: string) => {
  "use server";
  const event = getRequestEvent()!;
  if (!event.nativeEvent.context.user) {
    return new Error("Unauthorized");
  }
  const valid = z.string().uuid().safeParse(id);
  if (!valid.success) {
    return new Error("Invalid data");
  }
  const organizationId = valid.data;
  const o = await Organization.markAsDeleted({ id: organizationId });

  return o;
}, "organizations");

export const setOrganizationOwner = action(async (id: string) => {
  "use server";
  const event = getRequestEvent()!;
  if (!event.nativeEvent.context.user) {
    return new Error("Unauthorized");
  }
  const valid = z.string().uuid().safeParse(id);
  if (!valid.success) {
    return new Error("Invalid data");
  }
  const organizationId = valid.data;
  const o = await Organization.setOwner(organizationId, event.nativeEvent.context.user.id);

  return o;
});

export const setCurrentOrganization = action(async (data: FormData) => {
  "use server";
  const event = getRequestEvent()!;
  if (!event.nativeEvent.context.user) {
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
  const data_ = Object.fromEntries(data.entries());
  const valid = z.string().uuid().safeParse(data_.organization_id);
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
      workspace_id: currentSession.workspace_id,
    },
    {
      sessionId: sessionId,
    }
  );
  // console.log("new session with new workspace_id", session);
  appendHeader(event, "Set-Cookie", lucia.createSessionCookie(session.id).serialize());
  event.nativeEvent.context.session = session;
  return o;
}, "session");
