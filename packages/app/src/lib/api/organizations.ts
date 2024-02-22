import { Organization } from "@oetzilabs-plaaaner-com/core/src/entities/organizations";
import { action, cache, redirect } from "@solidjs/router";
import { getRequestEvent } from "solid-js/web";

export const createOrganization = action(async (form: FormData) => {
  "use server";
  const event = getRequestEvent()!;
  const user = event.nativeEvent.context.user;
  if (!user) {
    return redirect("/auth/login");
  }
  const data = Object.fromEntries(form.entries());
  const validation = Organization.safeParseCreate(data);
  if (!validation.success) {
    throw validation.error;
  }
  const x = await Organization.create(validation.data, user.id);
  if (!x) {
    throw new Error("Couldn't create organization");
  }
  const connected = await Organization.connectUser(x.id, user.id);
  if (!connected) {
    throw new Error("Couldn't connect user to organization");
  }
  return x;
}, "currentOrganization");

export const getOrganizations = cache(async () => {
  "use server";
  const event = getRequestEvent()!;
  if (!event.nativeEvent.context.user) {
    throw redirect("/auth/login");
  }
  const user = event.nativeEvent.context.user;
  const o = await Organization.findManyByUserId(user.id);
  return o;
}, "workspaces");
