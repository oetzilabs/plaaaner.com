import { NotLoggedIn } from "@/components/NotLoggedIn";
import { useSession } from "@/components/SessionProvider";
import { EntryBox } from "@/components/dashboard/entrybox";
import { PlansList } from "@/components/dashboard/plans-list";
import { A } from "@solidjs/router";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { Loader2 } from "lucide-solid";
import { Match, Show, Suspense, Switch, createSignal, onMount } from "solid-js";
dayjs.extend(relativeTime);

export default function DashboardPage() {
  const session = useSession();
  const isLoggedInLonger = (minutes: number) =>
    dayjs(session?.()?.createdAt).add(minutes, "minutes").isBefore(Date.now());

  return (
    <Suspense
      fallback={
        <div class="flex p-4 w-full h-full items-center justify-center text-muted-foreground">
          <Loader2 class="size-6 animate-spin" />
        </div>
      }
    >
      <Switch
        fallback={
          <div class="flex p-4 w-full h-full items-center justify-center text-muted-foreground">
            <Loader2 class="size-6 animate-spin" />
          </div>
        }
      >
        <Match when={typeof session !== "undefined" && session().user === null}>
          <div class="flex p-4 w-full h-full items-center justify-center">
            <div class="w-max h-max min-w-96">
              <NotLoggedIn />
            </div>
          </div>
        </Match>
        <Match when={!session}>
          <div class="flex p-4 w-full h-full items-center justify-center">
            <div class="w-max h-max min-w-96">
              <Loader2 class="size-4 animate-spin" />
            </div>
          </div>
        </Match>
        <Match when={typeof session !== "undefined" && session().user !== null && session()}>
          {(s) => (
            <div class="flex flex-col gap-8 grow min-h-0 max-h-screen">
              <div class="flex flex-col w-full grow min-h-0 max-h-[calc(100vh-49px)]">
                <div class="flex flex-col w-full flex-grow min-h-0 max-h-screen overflow-y-auto">
                  <div class="container flex flex-col gap-4 max-w-full md:max-w-6xl h-screen">
                    <div class="w-full h-auto flex flex-col pb-2 gap-4">
                      <div class="flex w-full flex-col gap-2 py-4">
                        <span class="font-medium text-3xl">
                          Welcome
                          <Show when={isLoggedInLonger(15)} fallback="">
                            {" "}
                            back
                          </Show>
                          , {s().user?.name}
                        </span>
                        <span class="text-sm">
                          Here's what's going on at{" "}
                          <A
                            href={
                              (s().workspace?.name ?? "default") === "default"
                                ? `/dashboard/organization/${s().organization?.id}`
                                : `/dashboard/organization/${s().organization?.id}/${s().workspace?.id}`
                            }
                            class="hover:underline text-indigo-500 font-medium"
                          >
                            {(s().workspace?.name ?? "default") === "default"
                              ? s().organization?.name
                              : s().workspace?.name}
                          </A>
                        </span>
                      </div>
                      <div class="w-full h-auto flex flex-row pb-2 gap-8 relative">
                        <div class="md:w-8/12 w-full">
                          <Suspense
                            fallback={
                              <div class="p-4 py-10 w-full flex flex-col items-center justify-center">
                                <Loader2 class="size-4 animate-spin" />
                              </div>
                            }
                          >
                            <EntryBox />
                          </Suspense>
                          <Suspense
                            fallback={
                              <div class="p-4 py-10 w-full flex flex-col items-center justify-center">
                                <Loader2 class="size-4 animate-spin" />
                              </div>
                            }
                          >
                            <PlansList session={s()} />
                          </Suspense>
                        </div>
                        <div class="hidden md:w-4/12 md:flex flex-col">
                          <div class="flex flex-col w-full gap-4 sticky top-0">
                            <Suspense
                              fallback={
                                <div class="p-4 w-full flex flex-col items-center justify-center">
                                  <Loader2 class="size-4 animate-spin" />
                                </div>
                              }
                            >
                              <div class="flex flex-col w-full gap-2">
                                <div class="flex flex-row w-full items-center justify-between">
                                  <div class="flex flex-col w-full font-medium">Notifications</div>
                                  <div class="flex flex-col w-full"></div>
                                </div>
                                <div class="flex flex-col w-full p-2 border relative border-neutral-200 dark:border-neutral-800 rounded-md min-h-10"></div>
                                <div class="flex flex-col w-full p-2 border relative border-neutral-200 dark:border-neutral-800 rounded-md min-h-10"></div>
                              </div>
                              <div class="flex flex-col w-full gap-2">
                                <div class="flex flex-row w-full items-center justify-between">
                                  <div class="flex flex-col w-full font-medium">Nearby Events</div>
                                  <div class="flex flex-col w-full min-h-10"></div>
                                </div>
                                <div class="flex flex-col w-full p-2 border relative border-neutral-200 dark:border-neutral-800 rounded-md min-h-10"></div>
                              </div>
                            </Suspense>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </Match>
      </Switch>
    </Suspense>
  );
}
