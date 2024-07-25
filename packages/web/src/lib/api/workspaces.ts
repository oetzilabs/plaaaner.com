import { WorkspaceCreateSchema } from "@oetzilabs-plaaaner-com/core/src/drizzle/sql/schemas/workspaces";
import { Workspace } from "@oetzilabs-plaaaner-com/core/src/entities/workspaces";
import { action, cache, redirect, revalidate } from "@solidjs/router";
import { appendHeader, getCookie, getEvent } from "vinxi/http";
import { z } from "zod";
import { lucia } from "../auth";
import { getAuthenticatedSession } from "../auth/util";

const WorkspaceCreateSchemaWithConnect = WorkspaceCreateSchema.extend({
  connect: z.boolean().optional().default(true),
});

export const getWorkspaces = cache(async () => {
  "use server";
  const event = getEvent()!;
  if (!event.context.user) {
    throw redirect("/auth/login");
  }
  const user = event.context.user;
  const ws = await Workspace.findManyByUserId(user.id);
  return ws;
}, "workspaces");

export const getWorkspace = cache(async (id: string) => {
  "use server";
  const event = getEvent()!;
  if (!event.context.user) {
    throw redirect("/auth/login");
  }
  const user = event.context.user;
  const ws = await Workspace.findById(id);
  return ws;
}, "workspace");

export const connectToWorkspace = action(async (workspace_id: string) => {
  "use server";
  const event = getEvent()!;
  const sessionId = getCookie(event, lucia.sessionCookieName) ?? null;
  if (!sessionId) {
    throw redirect("/auth/login");
  }
  const { session, user } = await lucia.validateSession(sessionId);
  if (!user || !session) {
    throw redirect("/auth/login");
  }
  const workspace = await Workspace.findById(workspace_id);
  if (!workspace) {
    throw new Error("Workspace not found");
  }
  const isConnected = await Workspace.hasUser(workspace.id, user.id);
  if (!isConnected) {
    console.log("not connected, connecting");
    await Workspace.connectUser(workspace.id, user.id);
  }

  await lucia.invalidateSession(sessionId);
  const new_session = await lucia.createSession(
    user.id,
    {
      access_token: session.access_token,
      workspace_id: workspace.id,
      organization_id: session.organization_id,
      createdAt: new Date(),
    },
    {
      sessionId: sessionId,
    }
  );
  appendHeader(event, "Set-Cookie", lucia.createSessionCookie(new_session.id).serialize());
  event.context.session = new_session;
  return workspace;
});

export const disconnectFromWorkspace = action(async (workspace_id: string) => {
  "use server";
  const event = getEvent()!;
  const sessionId = getCookie(event, lucia.sessionCookieName) ?? null;
  if (!sessionId) {
    throw redirect("/auth/login");
  }
  const { session, user } = await lucia.validateSession(sessionId);
  if (!user || !session) {
    throw redirect("/auth/login");
  }
  const workspace = await Workspace.findById(workspace_id);
  if (!workspace) {
    throw new Error("Workspace not found");
  }
  const isConnected = await Workspace.hasUser(workspace.id, user.id);
  if (!isConnected) {
    throw new Error("User is not connected to this workspace");
  }
  const ws = await Workspace.disconnectUser(workspace.id, user.id);

  await lucia.invalidateSession(sessionId);
  const new_session = await lucia.createSession(
    user.id,
    {
      access_token: session.access_token,
      workspace_id: null,
      organization_id: session.organization_id,
      createdAt: new Date(),
    },
    {
      sessionId: sessionId,
    }
  );
  appendHeader(event, "Set-Cookie", lucia.createSessionCookie(new_session.id).serialize());
  event.context.session = new_session;

  return ws;
});

export const createWorkspace = action(
  async (data: z.infer<typeof WorkspaceCreateSchemaWithConnect>, organization_id: string) => {
    "use server";
    const event = getEvent()!;
    const sessionId = getCookie(event, lucia.sessionCookieName) ?? null;
    if (!sessionId) {
      throw redirect("/auth/login");
    }
    const { session, user } = await lucia.validateSession(sessionId);
    if (!user || !session) {
      throw redirect("/auth/login");
    }
    const workspace = await Workspace.create(data, user.id, organization_id);
    await Workspace.connectUser(workspace.id, user.id);
    if (data.connect && data.connect) {
      await lucia.invalidateSession(sessionId);
      const new_session = await lucia.createSession(
        user.id,
        {
          access_token: session.access_token,
          workspace_id: workspace.id,
          organization_id: session.organization_id,
          createdAt: new Date(),
        },
        {
          sessionId: sessionId,
        }
      );
      appendHeader(event, "Set-Cookie", lucia.createSessionCookie(new_session.id).serialize());
      event.context.session = new_session;
    }

    return workspace;
  }
);

export const deleteWorkspace = action(async (id: string) => {
  "use server";
  const event = getEvent()!;
  if (!event.context.user) {
    throw redirect("/auth/login");
  }
  const sessionId = getCookie(event, lucia.sessionCookieName) ?? null;
  if (!sessionId) {
    throw redirect("/auth/login");
  }
  const { session, user } = await lucia.validateSession(sessionId);
  if (!user) {
    throw redirect("/auth/login");
  }
  const valid = z.string().uuid().safeParse(id);
  if (!valid.success) {
    throw new Error("Invalid data");
  }
  const workspaceId = valid.data;
  const ws = await Workspace.markAsDeleted({ id: workspaceId });
  await lucia.invalidateSession(sessionId);
  const new_session = await lucia.createSession(
    user.id,
    {
      access_token: session.access_token,
      organization_id: session.organization_id,
      workspace_id: null,
      createdAt: new Date(),
    },
    {
      sessionId: sessionId,
    }
  );
  appendHeader(event, "Set-Cookie", lucia.createSessionCookie(new_session.id).serialize());
  return ws;
});

export const setWorkspaceOwner = action(async (id: string) => {
  "use server";
  const event = getEvent()!;
  if (!event.context.user) {
    return new Error("Unauthorized");
  }
  const valid = z.string().uuid().safeParse(id);
  if (!valid.success) {
    return new Error("Invalid data");
  }
  const workspaceId = valid.data;
  const ws = await Workspace.setOwner(workspaceId, event.context.user.id);

  return ws;
});

export const setCurrentWorkspace = action(async (data: FormData) => {
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
      createdAt: new Date(),
    },
    {
      sessionId: sessionId,
    }
  );
  appendHeader(event, "Set-Cookie", lucia.createSessionCookie(session.id).serialize());
  event.context.session = session;
  return ws;
});