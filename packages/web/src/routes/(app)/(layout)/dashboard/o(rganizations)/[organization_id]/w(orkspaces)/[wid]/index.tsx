import { useSession } from "@/components/SessionProvider";
import { PlanActivity } from "@/components/dashboard/activity-components/plan";
import { Badge } from "@/components/ui/badge";
import { getOrganizationById } from "@/lib/api/organizations";
import { getWorkspace } from "@/lib/api/workspaces";
import { createAsync, redirect, useParams } from "@solidjs/router";
import { For, Match, Show, Switch } from "solid-js";
import { Transition, TransitionGroup } from "solid-transition-group";
import { getActivitiesByWorkspace } from "@/lib/api/activity";
import { PostActivity } from "@/components/dashboard/activity-components/post";
import { Footer } from "@/components/Footer";
import { Suspense } from "solid-js";
import { Skeleton } from "@/components/ui/skeleton";

export default function ActivityInOrganizationWorkspace() {
  const { organization_id, wid } = useParams();
  const session = useSession();
  if (!wid) throw redirect("/dashboard/workspaces", 303);

  const ws = createAsync(() => getWorkspace(wid));
  const os = createAsync(() => getOrganizationById(organization_id));
  const activities = createAsync(() => getActivitiesByWorkspace(wid));

  return (
    <div class="flex flex-col items-start w-full grow min-h-0 max-h-[calc(100vh-49px)]">
      <div class="flex flex-col items-start flex-grow min-h-0 max-h-screen w-full pt-10 gap-8  overflow-y-auto">
        <div class="flex flex-col gap-1 w-full container pb-60">
          <Show
            when={typeof session !== "undefined" && session()}
            fallback={
              <div class="flex flex-col items-center justify-center h-full w-full">
                <div class="flex flex-col items-center justify-center h-full w-full">
                  <h1 class="text-xl font-medium">Loading...</h1>
                </div>
              </div>
            }
          >
            {(s) => (
              <Show when={ws() && os() && activities() && { o: os()!, w: ws()!, activities: activities()! }}>
                {(i) => (
                  <div class="flex flex-col items-start h-full w-full gap-4">
                    <div class="w-full flex flex-row gap-2">
                      <Show
                        when={i().w.owner.id === s().user?.id}
                        fallback={
                          <Badge variant="secondary" class="text-xs px-2 py-1 rounded-md">
                            Owner: {i().w.owner.name}
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
                        <Show when={i().w.name === "default"} fallback={`Activities in ${i().w.name}`}>
                          Activities in this Workspace
                        </Show>
                      </h1>
                      <div class="flex gap-4 flex-col w-full">
                        <Suspense
                          fallback={
                            <div class="py-10 w-full flex flex-col items-center justify-center gap-4">
                              <For each={Array(5).fill(null)}>
                                {() => (
                                  <Skeleton
                                    class="w-full"
                                    style={{ height: `${Math.floor(Math.random() * 200) + 100}px` }}
                                  />
                                )}
                              </For>
                            </div>
                          }
                        >
                          <TransitionGroup name="slide-fade-up">
                            <For each={i().activities}>
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
                          </TransitionGroup>
                        </Suspense>
                      </div>
                    </div>
                  </div>
                )}
              </Show>
            )}
          </Show>
        </div>
        <Footer />
      </div>
    </div>
  );
}
