import { User } from "@oetzilabs-plaaaner-com/core/src/entities/users";
import { action, cache, redirect } from "@solidjs/router";
import { getRequestEvent } from "solid-js/web";

export const updateProfile = action(async (form: FormData) => {
  "use server";
  const event = getRequestEvent()!;
  const user = event.nativeEvent.context.user;
  if (!user) {
    return redirect("/auth/login");
  }
  const data = Object.fromEntries(form.entries());
  const validation = User.safeParseUpdate({
    ...data,
    id: user.id,
  });
  if (!validation.success) {
    throw validation.error;
  }
  const x = await User.update(validation.data);
  if (!x) {
    throw new Error("Couldn't update user profile");
  }
  return redirect("/setup/organization");
}, "profile");

export const getProfile = cache(async () => {
  "use server";
  const event = getRequestEvent()!;
  if (!event.nativeEvent.context.user) {
    throw redirect("/auth/login");
  }
  const user = event.nativeEvent.context.user;
  const u = await User.findById(user.id);
  return u;
}, "profile");
