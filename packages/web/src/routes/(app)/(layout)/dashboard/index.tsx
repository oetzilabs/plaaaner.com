import { Activities } from "@/components/dashboard/activity-list";
import { Disclaimers } from "@/components/dashboard/disclaimers";
import { EntryBox } from "@/components/dashboard/entrybox";
import { NearbyPlansList } from "@/components/dashboard/nearby-plans";
import { NotificationList } from "@/components/dashboard/notifications";
import { SmallFooter } from "@/components/dashboard/small-footer";
import { UpcomingPlans } from "@/components/dashboard/upcoming-plans";
import { NotLoggedIn } from "@/components/NotLoggedIn";
import { Button } from "@/components/ui/button";
import { getActivities } from "@/lib/api/activity";
import { getNotifications } from "@/lib/api/notifications";
import { getNearbyPlans, getUpcomingThreePlans } from "@/lib/api/plans";
import { getAuthenticatedSession, UserSession } from "@/lib/auth/util";
import { Title } from "@solidjs/meta";
import { A, createAsync, revalidate } from "@solidjs/router";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { Bolt, Loader2, Nut, RefreshCw, RotateCcw, Settings, Settings2 } from "lucide-solid";
import { Match, Show, Switch } from "solid-js";

dayjs.extend(relativeTime);

export const route = {
  preload: async () => {
    const session = await getAuthenticatedSession();
    const notifications = await getNotifications();
    const upcomingPlans = await getUpcomingThreePlans();
    const nearbyPlans = await getNearbyPlans();
    const activities = await getActivities();
    return { session, notifications, upcomingPlans, nearbyPlans, activities };
  },
};

export default function DashboardPage() {
  const session = createAsync(() => getAuthenticatedSession());

  const isLoggedInLonger = (session: UserSession, minutes: number) =>
    dayjs(session.createdAt).add(minutes, "minutes").isBefore(Date.now());

  return (
    <>
      <Title>Dashboard | Plaaaner</Title>
      <Switch
        fallback={
          <div class="flex p-4 w-full h-full items-center justify-center text-muted-foreground">
            <Loader2 class="size-6 animate-spin" />
          </div>
        }
      >
        <Match when={session() && session()!.user === null}>
          <div class="flex p-4 w-full h-full items-center justify-center">
            <div class="w-max h-max min-w-96">
              <NotLoggedIn />
            </div>
          </div>
        </Match>
        <Match when={session() && session()!.user !== null && session()} keyed>
          {(s) => (
            <div class="flex flex-col gap-8 grow min-h-0 max-h-screen">
              <div class="flex flex-col w-full grow min-h-0 max-h-[calc(100vh-49px)]">
                <div class="flex flex-col w-full flex-grow min-h-0 max-h-screen overflow-y-auto">
                  <div class="w-full sm:container !px-4 flex flex-col gap-4 max-w-full h-screen relative">
                    <div class="w-full h-auto grid grid-cols-1 md:grid-cols-12 grid-flow-row-dense gap-4">
                      <div class="col-span-8 flex w-full flex-col gap-2 pb-0 pt-4">
                        <span class="font-medium text-3xl">
                          Welcome
                          <Show when={isLoggedInLonger(s, 15)} fallback="">
                            {" "}
                            back
                          </Show>
                          , {s.user?.name}
                        </span>
                        <div class="w-full flex flex-row items-center gap-2 justify-between">
                          <div class="flex flex-row items-center gap-2 group">
                            <span class="text-sm flex gap-1">
                              Here's what's going on at{" "}
                              <A
                                href={`/dashboard/o/${s.organization?.id}/w/${s.workspace?.id}`}
                                class="hover:underline text-indigo-500 font-medium"
                              >
                                {(s.workspace?.name ?? "default") === "default"
                                  ? s.organization?.name
                                  : s.workspace?.name}
                              </A>
                              <Button variant="ghost" size="sm" class="!p-1 !size-5 group-hover:visible invisible">
                                <Bolt class="size-3" />
                              </Button>
                            </span>
                          </div>
                          <div class="flex flex-row items-center gap-2">
                            <Button
                              size="icon"
                              variant="outline"
                              class="!p-2 size-8"
                              onClick={async () =>
                                await revalidate(
                                  [
                                    getActivities.key,
                                    getNearbyPlans.key,
                                    getNotifications.key,
                                    getUpcomingThreePlans.key,
                                  ],
                                  true,
                                )
                              }
                            >
                              <span class="sr-only">Refresh</span>
                              <RefreshCw class="size-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                      <div class="col-span-4 hidden md:flex flex-col"></div>
                      <div class="col-span-8 w-full flex flex-col row-span-1 sticky top-0 z-10">
                        <EntryBox />
                      </div>
                      <div class="col-span-4 hidden md:flex flex-col row-span-12">
                        <div class="flex flex-col w-full gap-4 sticky top-6 pt-4">
                          <UpcomingPlans session={s} />
                          <NotificationList session={s} />
                          <NearbyPlansList session={s} />
                          <div class="flex flex-col w-full gap-2">
                            <SmallFooter />
                            <Disclaimers />
                          </div>
                        </div>
                      </div>
                      <div class="col-span-8 row-span-1 w-full flex flex-col">
                        <Activities session={s} />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </Match>
      </Switch>
    </>
  );
}
