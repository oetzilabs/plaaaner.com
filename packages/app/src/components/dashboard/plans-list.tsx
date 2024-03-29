import { getPlans } from "@/lib/api/plans";
import type { UserSession } from "@/lib/auth/util";
import { cn } from "@/lib/utils";
import { A, createAsync } from "@solidjs/router";
import dayjs from "dayjs";
import advancedFormat from "dayjs/plugin/advancedFormat";
import relativeTime from "dayjs/plugin/relativeTime";
import { For, Show } from "solid-js";
dayjs.extend(relativeTime);
dayjs.extend(advancedFormat);

export const PlansList = (props: { session: UserSession }) => {
  const plans = createAsync(() => getPlans());

  return (
    <div class="flex flex-col w-full gap-2">
      <div class="w-full h-auto py-4">
        <ol class="relative w-full">
          <For each={plans()}>
            {(plan, index) => (
              <A
                href={`/dashboard/organizations/${props.session.organization?.id}/workspace/${props.session.workspace?.id}/plans/${plan.id}`}
              >
                <li
                  class={cn(
                    "border relative border-neutral-200 dark:border-neutral-800 rounded-md hover:shadow-sm shadow-none transition-shadow",
                    {
                      "mb-10": index() < (plans()?.length ?? 0) - 1,
                    }
                  )}
                >
                  <Show when={index() < (plans()?.length ?? 0) - 1}>
                    <div class="absolute left-4 -bottom-10 w-[2px] h-10 bg-neutral-200 dark:bg-neutral-800"></div>
                  </Show>
                  <div class="w-full h-48 border-b border-neutral-200 dark:border-neutral-800"></div>
                  <div class="flex flex-row items-center justify-between px-3 py-2">
                    <div class="flex flex-col items-start">
                      <div class="flex flex-row gap-2 items-center">
                        <h3 class="text-sm font-semibold text-neutral-900 dark:text-white">{plan.name}</h3>
                        <time class="text-xs font-normal leading-none text-neutral-400 dark:text-neutral-500">
                          {dayjs(plan.createdAt).format("Do MMM, YYYY")}
                        </time>
                      </div>
                      <span class="text-xs font-normal text-neutral-500 dark:text-neutral-400">{plan.description}</span>
                    </div>
                    <div class="flex flex-col items-center justify-end"></div>
                  </div>
                </li>
              </A>
            )}
          </For>
        </ol>
      </div>
    </div>
  );
};
