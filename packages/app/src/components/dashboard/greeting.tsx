import { createAsync } from "@solidjs/router";
import { getAuthenticatedUser } from "@/lib/auth/util";
import { Show } from "solid-js";

export const Greeting = () => {
  const user = createAsync(() => getAuthenticatedUser());
  return <Show when={user()}>{(u) => <h1 class="text-2xl font-medium">Welcome back, {u().username}</h1>}</Show>;
};
