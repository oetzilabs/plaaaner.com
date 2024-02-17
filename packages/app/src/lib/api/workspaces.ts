import { Workspace } from "@oetzilabs-plaaaner-com/core/src/entities/workspaces";
import { cache, redirect } from "@solidjs/router";
import { getRequestEvent } from "solid-js/web";

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
