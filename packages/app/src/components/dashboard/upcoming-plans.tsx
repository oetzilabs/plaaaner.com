import { getUpcomingPlans } from "@/lib/api/plans";
import type { UserSession } from "@/lib/auth/util";
import { cn } from "@/lib/utils";
import { A, createAsync } from "@solidjs/router";
import dayjs from "dayjs";
import advancedFormat from "dayjs/plugin/advancedFormat";
import localizedFormat from "dayjs/plugin/localizedFormat";
import relativeTime from "dayjs/plugin/relativeTime";
import { For, Show } from "solid-js";
import { Transition, TransitionGroup } from "solid-transition-group";
import { buttonVariants } from "../ui/button";
dayjs.extend(relativeTime);
dayjs.extend(localizedFormat);
dayjs.extend(advancedFormat);

export const UpcomingPlans = (props: { session: UserSession }) => {
  const upcomingPlans = createAsync(() => getUpcomingPlans());

  return (
    <div class="flex flex-col w-full gap-2">
      <div class="flex flex-col w-full gap-2">
        <A
          href={`/dashboard/organizations/${props.session.organization?.id}/workspace/${props.session.workspace?.id}/plans`}
          class="flex flex-col w-full font-medium text-sm"
        >
          Upcoming Plans
        </A>
        <div class="flex flex-col w-full gap-2">
          <Show when={typeof upcomingPlans !== "undefined" && upcomingPlans()}>
            {(list) => (
              <TransitionGroup name="slide-fade-up">
                <For
                  each={list()}
                  fallback={
                    <div class="w-full flex flex-col items-center justify-center bg-neutral-50 dark:bg-neutral-950 text-muted-foreground text-xs p-3 border border-neutral-200 dark:border-neutral-800 rounded-md">
                      <span>No upcoming Plans, create one!</span>
                    </div>
                  }
                >
                  {(upcomingplan) => (
                    <Transition name="slide-fade-up">
                      <A
                        href={`/dashboard/plans/${upcomingplan.id}`}
                        class={cn(
                          buttonVariants({
                            variant: "ghost",
                            size: "sm",
                          }),
                          "flex flex-col w-full p-3 border relative border-neutral-200 dark:border-neutral-800 rounded-md h-auto"
                        )}
                      >
                        <div class="w-full flex flex-col gap-2">
                          <div class="w-full text-sm font-semibold">{upcomingplan.name}</div>
                          <div class="w-full text-xs text-muted-foreground">{upcomingplan.description}</div>
                        </div>
                      </A>
                    </Transition>
                  )}
                </For>
              </TransitionGroup>
            )}
          </Show>
        </div>
      </div>
    </div>
  );
};
