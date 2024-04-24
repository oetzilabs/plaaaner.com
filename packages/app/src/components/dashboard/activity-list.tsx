import { getActivities } from "@/lib/api/activity";
import type { UserSession } from "@/lib/auth/util";
import { refreshActivities, setFreshActivities } from "@/lib/utils";
import dayjs from "dayjs";
import advancedFormat from "dayjs/plugin/advancedFormat";
import localizedFormat from "dayjs/plugin/localizedFormat";
import relativeTime from "dayjs/plugin/relativeTime";
import { For, Match, Show, Switch, createEffect, createResource } from "solid-js";
import { Transition, TransitionGroup } from "solid-transition-group";
import { PlanActivity } from "./activity-components/plan";
import { PostActivity } from "./activity-components/post";
dayjs.extend(relativeTime);
dayjs.extend(localizedFormat);
dayjs.extend(advancedFormat);

export const Activities = (props: { session: UserSession }) => {
  // const activities = createAsync(() => getActivities());

  const [activities, actions] = createResource(() => getActivities());

  createEffect(() => {
    const rA = refreshActivities();
    if (rA.length > 0) {
      actions.mutate((oldActivities) => {
        if (!oldActivities) {
          const sortedActivities = rA
            .map((a) => a.activity)
            .sort((a, b) => {
              return dayjs(a.value.updatedAt ?? a.value.createdAt).isBefore(b.value.updatedAt ?? b.value.createdAt)
                ? 1
                : -1;
            });
          return sortedActivities;
        }
        let acs = [...oldActivities];
        // remove old activities
        acs = acs.filter(
          (a) => rA.findIndex((r) => r.change === "remove" && r.activity.value.id === a.value.id) === -1
        );
        // add new activities
        rA.filter((A) => A.change === "add").forEach((a) => {
          if (acs.findIndex((r) => r.value.id === a.activity.value.id) === -1) {
            acs.push(a.activity);
          }
        });
        const sortedActivities = acs.sort((a, b) => {
          return dayjs(a.value.updatedAt ?? a.value.createdAt).isBefore(b.value.updatedAt ?? b.value.createdAt)
            ? 1
            : -1;
        });
        return sortedActivities;
      });
      setFreshActivities([]);
    }
  });

  return (
    <div class="flex flex-col w-full gap-2">
      <div class="w-full h-auto py-2">
        <ol class="w-full pb-20">
          <TransitionGroup name="slide-fade-up">
            <Show when={typeof activities() !== "undefined" && activities()}>
              {(acts) => (
                <div class="w-full flex flex-col gap-4">
                  <For each={acts()}>
                    {(activity) => (
                      <Transition name="slide-fade-up">
                        <li class="border relative border-neutral-200 dark:border-neutral-800 rounded-lg hover:shadow-sm shadow-none transition-shadow bg-background overflow-clip">
                          <Switch>
                            <Match when={activity.type === "plan" && activity.value}>
                              {(plan) => <PlanActivity plan={plan()} session={props.session} />}
                            </Match>
                            <Match when={activity.type === "post" && activity.value}>
                              {(post) => <PostActivity post={post()} session={props.session} />}
                            </Match>
                          </Switch>
                        </li>
                      </Transition>
                    )}
                  </For>
                </div>
              )}
            </Show>
          </TransitionGroup>
        </ol>
      </div>
    </div>
  );
};
