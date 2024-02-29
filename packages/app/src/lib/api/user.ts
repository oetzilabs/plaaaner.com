import { Organization } from "@oetzilabs-plaaaner-com/core/src/entities/organizations";
import { User } from "@oetzilabs-plaaaner-com/core/src/entities/users";
import { action, redirect } from "@solidjs/router";
import { getRequestEvent } from "solid-js/web";
import { appendHeader, getCookie } from "vinxi/http";
import { z } from "zod";
import { lucia } from "../auth";

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

export const disableUser = action(async () => {
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
  const { id } = event.nativeEvent.context.user;
  await User.markAsDeleted({
    id,
  });
  await lucia.invalidateSession(sessionId);
  appendHeader(event, "Set-Cookie", lucia.createBlankSessionCookie().serialize());
  throw redirect("/");
}, "user");

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
    },
  );
  // console.log("new session with new workspace_id", session);
  appendHeader(event, "Set-Cookie", lucia.createSessionCookie(session.id).serialize());
  event.nativeEvent.context.session = session;
  return o;
}, "session");
