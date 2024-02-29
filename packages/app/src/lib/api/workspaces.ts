import { Workspace } from "@oetzilabs-plaaaner-com/core/src/entities/workspaces";
import { WorkspaceCreateSchema } from "@oetzilabs-plaaaner-com/core/src/drizzle/sql/schemas/workspaces";
import { action, cache, redirect } from "@solidjs/router";
import { getRequestEvent } from "solid-js/web";
import { z } from "zod";
import { appendHeader, getCookie } from "vinxi/http";
import { lucia } from "../auth";

const WorkspaceCreateSchemaWithConnect = WorkspaceCreateSchema.extend({
  connect: z.boolean().optional().default(true),
});

export const getWorkspaces = cache(async () => {
  "use server";
  const event = getRequestEvent()!;
  if (!event.nativeEvent.context.user) {
    throw redirect("/auth/login");
  }
  const user = event.nativeEvent.context.user;
  const ws = await Workspace.findManyByUserId(user.id);
  return ws;
}, "workspaces");

export const getWorkspace = cache(async (id: string) => {
  "use server";
  const event = getRequestEvent()!;
  if (!event.nativeEvent.context.user) {
    throw redirect("/auth/login");
  }
  const user = event.nativeEvent.context.user;
  const ws = await Workspace.findById(id);
  return ws;
}, "workspace");

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

export const createWorkspace = action(async (data: z.infer<typeof WorkspaceCreateSchemaWithConnect>) => {
  "use server";
  const event = getRequestEvent()!;
  if (!event.nativeEvent.context.user) {
    throw redirect("/auth/login");
  }
  const workspace = await Workspace.create(data, event.nativeEvent.context.user.id);
  if (data.connect && data.connect) {
    const currentSession = event.nativeEvent.context.session!;
    const currentWorkspace = await Workspace.findById(currentSession.workspace_id);
    if (currentWorkspace) {
      await Workspace.disconnectUser(currentWorkspace.id, event.nativeEvent.context.user.id);
    }
    await Workspace.connectUser(workspace.id, event.nativeEvent.context.user.id);
  }
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
    },
  );
  appendHeader(event, "Set-Cookie", lucia.createSessionCookie(session.id).serialize());
  event.nativeEvent.context.session = session;
  return ws;
}, "session");
