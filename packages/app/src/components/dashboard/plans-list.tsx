import { createAsync, A } from "@solidjs/router";
import { getPlans } from "@/lib/api/plans";
import { For } from "solid-js";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import type { UserSession } from "@/lib/auth/util";
import { buttonVariants } from "../ui/button";
import { Plus } from "lucide-solid";
import { cn } from "@/lib/utils";
dayjs.extend(relativeTime);

export const PlansList = (props: { session: UserSession }) => {
  const plans = createAsync(() => getPlans());

  return (
    <div class="flex flex-col w-full">
      <div class="flex flex-row items-center justify-between w-full py-2 gap-2">
        <A
          href="/dashboard"
          class={cn(
            buttonVariants({ variant: "ghost" }),
            "flex flex-row items-center justify-between gap-2 px-4 flex-1"
          )}
        >
          Plans
        </A>
        <A href="/plan/create" class={cn(buttonVariants({ variant: "outline", size: "icon" }), "size-9")}>
          <Plus class="size-4" />
        </A>
      </div>
      <div class="flex flex-col gap-2">
        <For each={plans()}>
          {(plan) => (
            <A
              href={`/dashboard/organizations/${props.session.organization?.id}/workspace/${props.session.workspace?.id}/plans/${plan.id}`}
              class={cn(
                buttonVariants({ variant: "ghost" }),
                "flex flex-row items-center justify-between gap-2 px-4 pr-2"
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
