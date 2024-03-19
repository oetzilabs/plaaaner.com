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
    <div class="flex flex-col w-full gap-2">
      <div class="flex flex-row items-center justify-between w-full gap-2">
        <A
          href="/dashboard"
          class={cn(
            buttonVariants({ variant: "ghost", size: "sm" }),
            "flex flex-row items-center justify-between gap-2 px-4 flex-1 text-sm"
          )}
        >
          Plans
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
              </div>
            </A>
          )}
        </For>
      </div>
      <A
        href="/plan/create"
        class={cn(
          buttonVariants({ variant: "outline", size: "icon" }),
          "w-full flex items-center justify-center gap-2"
        )}
      >
        <Plus class="size-4" />
        <span class="">Create New Plan</span>
      </A>
    </div>
  );
};
