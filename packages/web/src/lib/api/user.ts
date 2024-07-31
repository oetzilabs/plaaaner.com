import { Organization } from "@oetzilabs-plaaaner-com/core/src/entities/organizations";
import { User } from "@oetzilabs-plaaaner-com/core/src/entities/users";
import { Workspace } from "@oetzilabs-plaaaner-com/core/src/entities/workspaces";
import { action, redirect } from "@solidjs/router";
import { appendHeader, getCookie, getEvent } from "vinxi/http";
import { z } from "zod";
import { lucia } from "../auth";
import { getContext } from "../auth/context";

export const saveUser = action(async (data: FormData) => {
  "use server";
  const [ctx, event] = await getContext();
  if (!ctx) throw redirect("/auth/login");
  if (!ctx.session) throw redirect("/auth/login");
  if (!ctx.user) throw redirect("/auth/login");
  // @ts-expect-error
  const data_ = Object.fromEntries(data.entries());
  const d = { id: ctx.user.id, ...data_ };
  const valid = User.safeParseUpdate(d);
  if (!valid.success) {
    // console.log("valid.error", valid.error);
    return new Error("Invalid data");
  }
  const updatedUser = await User.update(valid.data);
  return updatedUser;
});

export const disableUser = action(async () => {
  "use server";
  const [ctx, event] = await getContext();
  if (!ctx) throw redirect("/auth/login");
  if (!ctx.session) throw redirect("/auth/login");
  if (!ctx.user) throw redirect("/auth/login");
  await User.markAsDeleted({
    id: ctx.user.id,
  });
  await lucia.invalidateSession(ctx.session.id);
  appendHeader(event, "Set-Cookie", lucia.createBlankSessionCookie().serialize());
  throw redirect("/", {
    status: 303,
    statusText: "Disabled user, redirecting to home",
  });
});

export const setDashboard = action(async (organization_id: string, workspace_id: string) => {
  "use server";
  const [ctx, event] = await getContext();
  if (!ctx) throw redirect("/auth/login");
  if (!ctx.session) throw redirect("/auth/login");
  if (!ctx.user) throw redirect("/auth/login");
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

  await lucia.invalidateSession(ctx.session.id);
  const session = await lucia.createSession(
    ctx.user.id,
    {
      access_token: ctx.session.access_token,
      organization_id: o.id,
      workspace_id: w.id,
      createdAt: new Date(),
    },
    {
      sessionId: ctx.session.id,
    },
  );
  // console.log("new session with new workspace_id", session);
  appendHeader(event, "Set-Cookie", lucia.createSessionCookie(session.id).serialize());
  event.context.session = session;
  return o;
});

export const setCurrentOrganization = action(async (id: string) => {
  "use server";
  const [ctx, event] = await getContext();
  if (!ctx) throw redirect("/auth/login");
  if (!ctx.session) throw redirect("/auth/login");
  if (!ctx.user) throw redirect("/auth/login");

  const valid = z.string().uuid().safeParse(id);
  if (!valid.success) {
    return new Error("Invalid data");
  }
  const organizationId = valid.data;
  const o = await Organization.findById(organizationId);
  if (!o) {
    return new Error("Organization not found");
  }

  await lucia.invalidateSession(ctx.session.id);
  const session = await lucia.createSession(
    ctx.user.id,
    {
      access_token: ctx.session.access_token,
      organization_id: o.id,
      workspace_id: null,
      createdAt: new Date(),
    },
    {
      sessionId: ctx.session.id,
    },
  );
  // console.log("new session with new workspace_id", session);
  appendHeader(event, "Set-Cookie", lucia.createSessionCookie(session.id).serialize());
  event.context.session = session;

  return o;
});
