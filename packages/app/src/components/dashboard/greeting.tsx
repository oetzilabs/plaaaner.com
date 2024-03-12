import { A, createAsync, useAction, useSubmission } from "@solidjs/router";
import type { UserSession } from "@/lib/auth/util";
import { Show } from "solid-js";
import { buttonVariants } from "../ui/button";
import { cn } from "@/lib/utils";
import { Plus } from "lucide-solid";

export const Greeting = (props: { session: UserSession }) => {

  return (
    <div class="flex flex-col gap-2">
      <div class="flex flex-col items-start gap-2 w-full">
        <div class="flex flex-row items-center justify-between w-full">
          <Show when={props.session.user}>{(u) => <h1 class="text-2xl font-bold">Welcome back, {u().name}</h1>}</Show>
          <Show when={props.session.user}>
            <A
              href="/plan/create"
              class={cn(
                "gap-2 w-max flex",
                buttonVariants({
                  variant: "default",
                  size: "sm",
                })
              )}
            >
              <Plus class="w-4 h-4" />
              <span class="w-max">Create Plan</span>
            </A>
          </Show>
        </div>
      </div>
      <Show when={props.session.workspace}>
        {(ws) => (
          <span class="text-xs text-muted-foreground">
            Here's what's happening {ws().name !== "default" ? `at '${ws().name}'` : "with your workspace"} today:
          </span>
        )}
      </Show>
    </div>
  );
};
