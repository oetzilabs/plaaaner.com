import { User } from "@oetzilabs-plaaaner-com/core/src/entities/users";
import { action, cache, redirect, revalidate } from "@solidjs/router";
import { getEvent } from "vinxi/http";

export const updateProfile = action(async (form: FormData) => {
  "use server";
  const event = getEvent()!;
  const user = event.context.user;
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
});

export const getProfile = cache(async () => {
  "use server";
  const event = getEvent()!;
  if (!event.context.user) {
    throw redirect("/auth/login");
  }
  const user = event.context.user;
  const u = await User.findById(user.id);
  return u;
}, "profile");
