import { prefixed_cuid2 } from "@oetzilabs-plaaaner-com/core/src/custom_cuid2";
import { WorkspaceCreateSchema } from "@oetzilabs-plaaaner-com/core/src/drizzle/sql/schemas/workspaces";
import { Workspace } from "@oetzilabs-plaaaner-com/core/src/entities/workspaces";
import { action, cache, redirect } from "@solidjs/router";
import { appendHeader, getCookie, getEvent } from "vinxi/http";
import { z } from "zod";
import { lucia } from "../auth";
import { getContext } from "../auth/context";

const WorkspaceCreateSchemaWithConnect = WorkspaceCreateSchema.extend({
  connect: z.boolean().optional().default(true),
});

export const getWorkspaces = cache(async () => {
  "use server";
  const [ctx, event] = await getContext();
  if (!ctx) throw redirect("/auth/login");
  if (!ctx.session) throw redirect("/auth/login");
  if (!ctx.user) throw redirect("/auth/login");

  const ws = await Workspace.findManyByUserId(ctx.user.id);
  return ws;
}, "workspaces");

export const getWorkspace = cache(async (id: string) => {
  "use server";
  const [ctx, event] = await getContext();
  if (!ctx) throw redirect("/auth/login");
  if (!ctx.session) throw redirect("/auth/login");
  if (!ctx.user) throw redirect("/auth/login");
  const ws = await Workspace.findById(id);
  if (!ws) {
    throw redirect("/404", { status: 404, statusText: "Not Found" });
  }

  const isConnected = await Workspace.hasUser(ws.id, ctx.user.id);
  if (!isConnected) {
    throw redirect("/403", { status: 403, statusText: "You are not connected to this workspace" });
  }

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
    },
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
    },
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
        },
      );
      appendHeader(event, "Set-Cookie", lucia.createSessionCookie(new_session.id).serialize());
      event.context.session = new_session;
    }

    return workspace;
  },
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
  const valid = prefixed_cuid2.safeParse(id);
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
    },
  );
  appendHeader(event, "Set-Cookie", lucia.createSessionCookie(new_session.id).serialize());
  return ws;
});

export const setWorkspaceOwner = action(async (id: string) => {
  "use server";
  const [ctx, event] = await getContext();
  if (!ctx) throw redirect("/auth/login");
  if (!ctx.session) throw redirect("/auth/login");
  if (!ctx.user) throw redirect("/auth/login");
  const valid = prefixed_cuid2.safeParse(id);
  if (!valid.success) {
    return new Error("Invalid data");
  }
  const workspaceId = valid.data;
  const ws = await Workspace.setOwner(workspaceId, ctx.user.id);

  return ws;
});

export const setCurrentWorkspace = action(async (data: FormData) => {
  "use server";
  const [ctx, event] = await getContext();
  if (!ctx) throw redirect("/auth/login");
  if (!ctx.session) throw redirect("/auth/login");
  if (!ctx.user) throw redirect("/auth/login");
  // @ts-expect-error
  const data_ = Object.fromEntries(data.entries());
  const valid = prefixed_cuid2.safeParse(data_.workspace_id);
  if (!valid.success) {
    return new Error("Invalid data");
  }
  const workspaceId = valid.data;
  const ws = await Workspace.findById(workspaceId);
  if (!ws) {
    return new Error("Workspace not found");
  }

  await lucia.invalidateSession(ctx.session.id);
  const session = await lucia.createSession(
    ctx.user.id,
    {
      access_token: ctx.session.access_token,
      workspace_id: ws.id,
      organization_id: ctx.session.organization_id,
      createdAt: new Date(),
    },
    {
      sessionId: ctx.session.id,
    },
  );
  appendHeader(event, "Set-Cookie", lucia.createSessionCookie(session.id).serialize());
  event.context.session = session;
  return ws;
});
