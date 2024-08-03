import type { Activity } from "@/core/entities/activities";
import { getActivities } from "@/lib/api/activity";
import type { UserSession } from "@/lib/auth/util";
import { createAsync } from "@solidjs/router";
import dayjs from "dayjs";
import advancedFormat from "dayjs/plugin/advancedFormat";
import localizedFormat from "dayjs/plugin/localizedFormat";
import relativeTime from "dayjs/plugin/relativeTime";
import { Accessor, createEffect, createSignal, For, Match, onCleanup, onMount, Show, Switch } from "solid-js";
import { Transition, TransitionGroup } from "solid-transition-group";
import { useWebsocket } from "../providers/Websocket";
import { PlanActivity } from "./activity-components/plan";
import { PostActivity } from "./activity-components/post";

dayjs.extend(relativeTime);
dayjs.extend(localizedFormat);
dayjs.extend(advancedFormat);

export const Activities = (props: { session: UserSession }) => {
  const activities = createAsync(() => getActivities());

  return (
    <div class="flex flex-col w-full gap-2">
      <div class="w-full h-auto py-2">
        <ol class="w-full pb-20">
          <Show when={activities()}>
            {(acts) => (
              <div class="w-full flex flex-col gap-4">
                <RealtimeActivities initialActivities={acts} session={props.session} />
              </div>
            )}
          </Show>
        </ol>
      </div>
    </div>
  );
};

const RealtimeActivities = (props: { initialActivities: Accessor<Activity[]>; session: UserSession }) => {
  const ws = useWebsocket();
  const [activitiesList, setActivitiesList] = createSignal<Activity[]>(props.initialActivities());

  // createEffect(() => {
  //   const as = props.initialActivities();
  //   setActivitiesList(as);
  // });

  onMount(() => {
    if (!ws) return;

    const created_listener = ws.subscribe("activity:created");
    const unsub_created = created_listener((data) => {
      if (!data) return;
      if (!data.payload) return;
      setActivitiesList((as) => [...as, data.payload]);
    });

    const deleted_listener = ws.subscribe("activity:deleted");
    const unsub_deleted = deleted_listener((data) => {
      if (!data) return;
      if (!data.payload) return;
      setActivitiesList((as) => as.filter((a) => a.value.id !== data.payload.value.id));
    });

    const updated_listener = ws.subscribe("activity:updated");
    const unsub_updated = updated_listener((data) => {
      if (!data) return;
      if (!data.payload) return;
      setActivitiesList((as) => as.map((a) => (a.value.id === data.payload.value.id ? data.payload : a)));
    });

    onCleanup(() => {
      unsub_created();
      unsub_deleted();
      unsub_updated();
    });
  });

  return (
    <For
      each={activitiesList()}
      fallback={
        <div class="flex w-full h-full items-center justify-center bg-neutral-100 dark:bg-neutral-900 rounded-lg p-8 text-muted-foreground text-sm">
          No activities yet
        </div>
      }
    >
      {(activity) => (
        <Transition name="slide-fade-up">
          <li class="border relative border-neutral-200 dark:border-neutral-800 rounded-lg hover:shadow-sm shadow-none transition-shadow bg-background overflow-clip first:-mt-6">
            <Switch>
              <Match when={activity.type === "plan" && activity.value} keyed>
                {(plan) => <PlanActivity plan={plan} session={props.session} />}
              </Match>
              <Match when={activity.type === "post" && activity.value} keyed>
                {(post) => <PostActivity post={post} session={props.session} />}
              </Match>
            </Switch>
          </li>
        </Transition>
      )}
    </For>
  );
};
