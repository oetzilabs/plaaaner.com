import { A, createAsync } from "@solidjs/router";
import { getAuthenticatedUser } from "@/lib/auth/util";
import { Show } from "solid-js";
import { buttonVariants } from "../ui/button";
import { cn } from "@/lib/utils";
import { Plus } from "lucide-solid";

export const Greeting = () => {
  const user = createAsync(() => getAuthenticatedUser());
  return (
    <div class="flex flex-row items-center justify-between">
      <Show when={user()}>{(u) => <h1 class="text-2xl font-bold">Welcome back, {u().username}</h1>}</Show>
      <Show when={user()}>
        <A
          href="/plan/create"
          class={cn("gap-2",
            buttonVariants({
              variant: "default",
              size: "sm",
            })
          )}
        >
        <Plus class="w-4 h-4" />
          Create Plan
        </A>
      </Show>
    </div>
  );
};
