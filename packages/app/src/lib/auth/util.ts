import { cache, redirect } from "@solidjs/router";
import { getRequestEvent } from "solid-js/web";
import { lucia } from ".";
import { appendHeader, getCookie } from "vinxi/http";
import { Organization } from "@oetzilabs-plaaaner-com/core/src/entities/organizations";

export const getAuthenticatedUser = cache(async () => {
  "use server";
  const event = getRequestEvent()!;
  if (!event.nativeEvent.context.session) {
    throw redirect("/auth/login");
  }
  const { id } = event.nativeEvent.context.session;
  const { user } = await lucia.validateSession(id);
  return user;
}, "user");

export const getAuthenticatedSession = cache(async () => {
  "use server";
  const event = getRequestEvent()!;
  const sessionId = getCookie(event, lucia.sessionCookieName) ?? null;
  if (!sessionId) {
    return redirect("/auth/login");
  }
  // console.log({ sessionId });
  const { session, user } = await lucia.validateSession(sessionId);
  // console.log({ session, user });
  return session;
}, "session");

export const getAuthenticatedSessions = cache(async () => {
  "use server";
  const event = getRequestEvent()!;
  if (!event.nativeEvent.context.user) {
    return redirect("/auth/login");
  }
  const { id } = event.nativeEvent.context.user;
  const sessions = await lucia.getUserSessions(id);
  return sessions;
}, "sessions");

export const getCurrentOrganization = cache(async () => {
  "use server";
  const event = getRequestEvent()!;
  if (!event.nativeEvent.context.session) {
    return redirect("/auth/login");
  }
  const { id } = event.nativeEvent.context.session;
  const { user } = await lucia.validateSession(id);
  if(!user) {
    return redirect("/auth/login");
  }
  const org = await Organization.findByUserId(user.id);
  if(!org) {
    console.log("No organization set up");
    return redirect("/setup/organization");
  }
  console.log(org)
  return org;
}, "currentOrganization");
