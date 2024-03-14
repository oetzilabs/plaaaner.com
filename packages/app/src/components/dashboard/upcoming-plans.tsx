import { createAsync, A } from "@solidjs/router";
import { getPlans } from "@/lib/api/plans";
import { For, Show } from "solid-js";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { Progress } from "../ui/progress";
import { cn } from "@/lib/utils";
import { Badge } from "../ui/badge";
import { Separator } from "../ui/separator";
import type { UserSession } from "@/lib/auth/util";
dayjs.extend(relativeTime);

export const UpcomingPlans = (props: { session: UserSession }) => {
  const plans = createAsync(() => getPlans());

  return (
    <div class="grid grid-cols-1 sm:grid-cols-2 w-full gap-2">
      <For each={plans()}>
        {(plan) => (
          <A
            class="flex flex-col gap-4 items-start p-4 w-full h-full justify-start border border-neutral-200 dark:border-neutral-800 rounded-md hover:bg-neutral-100 dark:hover:bg-neutral-900 group shadow-sm hover:shadow"
            href={`plans/${plan.id}`}
          >
            <div class="flex flex-col gap-2 w-full">
              <div class="flex flex-col gap-0.5">
                <span class="text-base font-medium">{plan.name}</span>
                <span class="text-xs text-muted-foreground break-words">in {dayjs().to(plan.createdAt, true)}</span>
              </div>
              <div class="w-full flex flex-row items-center justify-between gap-4">
                <Progress value={plan.progress} />
                <span class="text-muted-foreground text-xs">{plan.progress}%</span>
              </div>
            </div>
          </A>
        )}
      </For>
    </div>
  );
};
