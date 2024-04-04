import { getNearbyPlans } from "@/lib/api/plans";
import type { UserSession } from "@/lib/auth/util";
import { A, createAsync } from "@solidjs/router";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { Lightbulb, Notebook } from "lucide-solid";
import { For, JSXElement, Show } from "solid-js";
import { buttonVariants } from "../ui/button";
import { cn } from "@/lib/utils";
dayjs.extend(relativeTime);

const PlanTypeIcons: Record<string, JSXElement> = {
  event: <Notebook class="size-4" />,
  unknown: <Notebook class="size-4" />,
  custom: <Lightbulb class="size-4" />,
};

export const NearbyPlansList = (props: { session: UserSession }) => {
  const nearbyPlans = createAsync(() => getNearbyPlans());

  return (
    <div class="flex flex-col w-full">
      <div class="flex flex-col w-full gap-2">
        <A href="/nearby-plans" class="flex flex-col w-full font-medium text-sm">
          Nearby Events
        </A>
        <div class="flex flex-col w-full gap-2">
          <Show when={typeof nearbyPlans !== undefined && nearbyPlans()}>
            {(nearby) => (
              <For
                each={nearby()}
                fallback={
                  <div class="w-full flex flex-col items-center justify-center bg-neutral-50 dark:bg-neutral-950 text-muted-foreground text-xs p-2 border border-neutral-200 dark:border-neutral-800 rounded-md">
                    No nearby plans available
                  </div>
                }
              >
                {(plan) => (
                  <A
                    href={plan.url}
                    class={cn(
                      buttonVariants({
                        variant: "outline",
                        size: "sm",
                      }),
                      "flex flex-col w-full p-3 relative rounded-md h-auto gap-2"
                    )}
                  >
                    <div class="w-full flex flex-row items-center justify-between">
                      <div class="flex flex-row items-center justify-start w-full text-sm font-semibold">
                        {plan.name}
                      </div>
                      <div class="flex flex-row items-center justify-end w-max text-muted-foreground">
                        <Show
                          when={plan.type in PlanTypeIcons && PlanTypeIcons[plan.type]}
                          fallback={PlanTypeIcons.unknown}
                        >
                          {(icon) => {
                            const Icon = icon();
                            return Icon;
                          }}
                        </Show>
                      </div>
                    </div>
                    <div class="flex flex-row w-full text-xs font-normal text-muted-foreground">{plan.description}</div>
                  </A>
                )}
              </For>
            )}
          </Show>
        </div>
      </div>
    </div>
  );
};
