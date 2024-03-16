import { createAsync, A } from "@solidjs/router";
import { getPlans } from "@/lib/api/plans";
import { For } from "solid-js";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import type { UserSession } from "@/lib/auth/util";
import { Button, buttonVariants } from "../ui/button";
import { Plus } from "lucide-solid";
import { cn } from "@/lib/utils";
dayjs.extend(relativeTime);

export const PlansList = (props: { session: UserSession }) => {
  const plans = createAsync(() => getPlans());

  return (
    <div class="flex flex-col w-full">
      <div class="flex flex-row items-center justify-between w-full py-2">
        <A
          href="/dashboard"
          class={cn(
            buttonVariants({ variant: "ghost" }),
            "w-full h-auto py-1 px-3 flex flex-row items-center justify-between gap-2"
          )}
        >
          Plans
          <A href="/plan/create" class={cn(buttonVariants({ variant: "ghost", size: "icon" }), "size-6")}>
            <Plus class="size-3" />
          </A>
        </A>
      </div>
      <div class="flex flex-col gap-1">
        <For each={plans()}>
          {(plan) => (
            <A
              href={`/dashboard/organizations/${props.session.organization?.id}/workspace/${props.session.workspace?.id}/plans/${plan.id}`}
              class={cn(
                buttonVariants({ variant: "ghost" }),
                "w-full h-auto py-1 px-3 flex flex-row items-center justify-between gap-2"
              )}
            >
              <div class="flex flex-row gap-2 w-full items-center justify-between">
                <span class="text-sm font-medium">{plan.name}</span>
                <span class="text-muted-foreground text-xs">{plan.progress}%</span>
              </div>
            </A>
          )}
        </For>
      </div>
    </div>
  );
};
