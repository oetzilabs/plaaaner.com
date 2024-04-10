import { getActivities } from "@/lib/api/activity";
import type { UserSession } from "@/lib/auth/util";
import { cn } from "@/lib/utils";
import type { Plans } from "@oetzilabs-plaaaner-com/core/src/entities/plans";
import { A } from "@solidjs/router";
import dayjs from "dayjs";
import advancedFormat from "dayjs/plugin/advancedFormat";
import localizedFormat from "dayjs/plugin/localizedFormat";
import relativeTime from "dayjs/plugin/relativeTime";
import { For, Show, createResource } from "solid-js";
import { Transition, TransitionGroup } from "solid-transition-group";
import { useSession } from "../SessionProvider";
import { PlanCommentsSection } from "./post-comment";
dayjs.extend(relativeTime);
dayjs.extend(localizedFormat);
dayjs.extend(advancedFormat);

export const Activities = (props: { session: UserSession }) => {
  const [activities, actions] = createResource(() => getActivities({ fromDate: null }));
  const session = useSession();

  const lastPlan = (index: number, plans: Plans.Frontend[]) => index < plans.length - 1;

  return (
    <div class="flex flex-col w-full gap-2">
      <div class="w-full h-auto py-2">
        <ol class="w-full pb-20">
          <Show when={typeof session !== "undefined" && session()!}>
            {(sess) => (
              <TransitionGroup name="slide-fade-up">
                <Show when={typeof activities !== "undefined" && activities()}>
                  {(acts) => (
                    <For each={acts().plans}>
                      {(plan, index) => (
                        <Transition name="slide-fade-up">
                          <div class="w-full h-auto relative">
                            <Show when={lastPlan(index(), acts().plans)}>
                              <div class="absolute left-4 -bottom-10 w-px h-10 bg-neutral-200 dark:bg-neutral-800"></div>
                            </Show>
                            <li
                              class={cn(
                                "border relative border-neutral-200 dark:border-neutral-800 rounded-md hover:shadow-sm shadow-none transition-shadow bg-background overflow-clip",
                                {
                                  "mb-10": lastPlan(index(), acts().plans),
                                }
                              )}
                            >
                              <A
                                href={`/dashboard/organizations/${props.session.organization?.id}/workspace/${props.session.workspace?.id}/plans/${plan.id}`}
                                class="rounded-md bg-background"
                              >
                                <div class="w-full h-48 border-b border-neutral-200 dark:border-neutral-800 bg-muted"></div>
                                <div class="flex flex-col p-2 border-b border-neutral-200 dark:border-neutral-800 w-full">
                                  <div class="flex flex-col items-start w-full">
                                    <div class="flex flex-row gap-2 items-center justify-between w-full">
                                      <h3 class="text-sm font-semibold text-neutral-900 dark:text-white w-max">
                                        {plan.name}
                                      </h3>
                                      <time class="text-xs font-normal leading-none text-neutral-400 dark:text-neutral-500 w-max">
                                        {dayjs(plan.createdAt).format("Do MMM, YYYY")}
                                      </time>
                                    </div>
                                    <span class="text-xs font-normal text-neutral-500 dark:text-neutral-400">
                                      {plan.description}
                                    </span>
                                  </div>
                                </div>
                              </A>
                              <PlanCommentsSection
                                planId={plan.id}
                                username={sess().user?.name ?? "John Doe"}
                                increment={3}
                              />
                            </li>
                          </div>
                        </Transition>
                      )}
                    </For>
                  )}
                </Show>
              </TransitionGroup>
            )}
          </Show>
        </ol>
      </div>
    </div>
  );
};
