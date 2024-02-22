import { A, createAsync } from "@solidjs/router";
import { getAuthenticatedUser, getCurrentOrganization } from "@/lib/auth/util";
import { Show } from "solid-js";
import { buttonVariants } from "../ui/button";
import { cn } from "@/lib/utils";
import { Plus } from "lucide-solid";
import { Badge } from "../ui/badge";

export const Greeting = () => {
  const user = createAsync(() => getAuthenticatedUser());
  const currentOrganization = createAsync(() => getCurrentOrganization());
  return (
    <div class="flex flex-col items-start gap-2 w-full">
      <Show when={currentOrganization()} fallback={<Badge variant="outline">No Organization</Badge>}>
        {(cO) => <Badge variant="secondary">{cO().name}</Badge>}
      </Show>
      <div class="flex flex-row items-center justify-between w-full">
        <Show when={user()}>{(u) => <h1 class="text-2xl font-bold">Welcome back, {u().username}</h1>}</Show>
        <Show when={user()}>
          <A
            href="/plan/create"
            class={cn(
              "gap-2",
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
    </div>
  );
};
