import { action, redirect } from "@solidjs/router";
import { getRequestEvent } from "solid-js/web";
import { lucia } from "../../lib/auth";
import { appendHeader } from "vinxi/http";
import { User } from "@oetzilabs-plaaaner-com/core/src/entities/users";
import { Workspace } from "@oetzilabs-plaaaner-com/core/src/entities/workspaces";
import { WorkspaceCreateSchema } from "@/core/drizzle/sql/schema";
import { z } from "zod";

export const logout = action(async () => {
  "use server";
  const event = getRequestEvent()!;
  console.log("hello from logout action");
  if (!event.nativeEvent.context.session) {
    return new Error("Unauthorized");
  }
  await lucia.invalidateSession(event.nativeEvent.context.session.id);
  appendHeader(event, "Set-Cookie", lucia.createBlankSessionCookie().serialize());
  throw redirect("/auth/login", 303);
});

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
    console.log("valid.error", valid.error);
    return new Error("Invalid data");
  }
  const updatedUser = await User.update(valid.data);
  return updatedUser;
});

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
});

export const createWorkspace = action(async (data: z.infer<typeof WorkspaceCreateSchema>) => {
  "use server";
  const event = getRequestEvent()!;
  if (!event.nativeEvent.context.user) {
    return new Error("Unauthorized");
  }
  const workspace = await Workspace.create(data);
  const connectedWorkspace = await Workspace.connectUser(workspace.id, event.nativeEvent.context.user.id);

  return workspace;
});

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
});

export const ownWorkspace = action(async (id: string) => {
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
