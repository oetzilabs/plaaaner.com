import { PlanActivity } from "@/components/dashboard/activity-components/plan";
import { PostActivity } from "@/components/dashboard/activity-components/post";
import { Footer } from "@/components/Footer";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { getActivitiesByWorkspace } from "@/lib/api/activity";
import { getOrganizationById } from "@/lib/api/organizations";
import { getWorkspace } from "@/lib/api/workspaces";
import { getAuthenticatedSession } from "@/lib/auth/util";
import { createAsync, redirect, RoutePreloadFuncArgs, useParams } from "@solidjs/router";
import { For, Match, Show, Suspense, Switch } from "solid-js";
import { Transition, TransitionGroup } from "solid-transition-group";

export const route = {
  preload: async (props: RoutePreloadFuncArgs) => {
    const session = getAuthenticatedSession();
    const org = await getOrganizationById(props.params.organization_id);
    const ws = await getWorkspace(props.params.wid);
    const activities = await getActivitiesByWorkspace(props.params.wid);
    return { org, ws, session, activities };
  },
};

export default function ActivityInOrganizationWorkspace() {
  const params = useParams();
  if (!params.wid) throw redirect("/dashboard/workspaces", 303);

  const session = createAsync(() => getAuthenticatedSession());
  const ws = createAsync(() => getWorkspace(params.wid));
  const os = createAsync(() => getOrganizationById(params.organization_id));
  const activities = createAsync(() => getActivitiesByWorkspace(params.wid));

  return (
    <div class="flex flex-col items-start w-full grow min-h-0 max-h-[calc(100vh-49px)]">
      <div class="flex flex-col items-start flex-grow min-h-0 max-h-screen w-full pt-10 gap-8  overflow-y-auto">
        <div class="flex flex-col gap-1 w-full container pb-60">
          <Show
            when={session()}
            fallback={
              <div class="flex flex-col items-center justify-center h-full w-full">
                <div class="flex flex-col items-center justify-center h-full w-full">
                  <h1 class="text-xl font-medium">Loading...</h1>
                </div>
              </div>
            }
          >
            {(s) => (
              <Show when={ws() !== undefined && os() !== undefined && activities() !== undefined}>
                <div class="flex flex-col items-start h-full w-full gap-4">
                  <div class="w-full flex flex-row gap-2">
                    <Show
                      when={ws()!.owner.id === s().user?.id}
                      fallback={
                        <Badge variant="secondary" class="text-xs px-2 py-1 rounded-md">
                          Owner: {ws()!.owner.name}
                        </Badge>
                      }
                    >
                      <Badge variant="secondary" class="text-xs px-2 py-1 rounded-md">
                        This Workspace belongs to you
                      </Badge>
                    </Show>
                  </div>
                  <div class="w-full flex flex-col gap-4">
                    <h1 class="text-xl font-medium">
                      <Show when={ws()!.name === "default"} fallback={`Activities in ${ws()!.name}`}>
                        Activities in this Workspace
                      </Show>
                    </h1>
                    <div class="flex gap-4 flex-col w-full">
                      <For each={activities()!}>
                        {(p) => (
                          <Transition name="slide-fade-up">
                            <div class="border relative border-neutral-200 dark:border-neutral-800 rounded-md hover:shadow-sm shadow-none transition-shadow bg-background overflow-clip">
                              <Switch>
                                <Match when={p.type === "plan" && p.value}>
                                  {(plan) => <PlanActivity plan={plan()} session={s()} />}
                                </Match>
                                <Match when={p.type === "post" && p.value}>
                                  {(post) => <PostActivity post={post()} session={s()} />}
                                </Match>
                              </Switch>
                            </div>
                          </Transition>
                        )}
                      </For>
                    </div>
                  </div>
                </div>
              </Show>
            )}
          </Show>
        </div>
        <Footer />
      </div>
    </div>
  );
}
