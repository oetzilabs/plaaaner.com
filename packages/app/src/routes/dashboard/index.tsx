import { A, createAsync } from "@solidjs/router";
import { For, Show } from "solid-js";
import { getNotifications } from "@/lib/api/notifications";
import { getAuthenticatedUser } from "@/lib/auth/util";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { As } from "@kobalte/core";
import { Button } from "../../components/ui/button";
import { GitGraph } from "lucide-solid";
dayjs.extend(relativeTime);

export default function DashboardPage() {
  const user = createAsync(() => getAuthenticatedUser());
  const notifications = createAsync(() => getNotifications());

  return (
    <div class="flex flex-col gap-8 py-10">
      <Show when={user()}>
        {(u) => (
          <div class="flex flex-col gap-12">
            <div class="flex flex-col gap-2">
              <h1 class="text-2xl font-medium">Welcome back, {u().username}</h1>
              <span class="text-xs text-muted-foreground">Here's what's happening with your workspace today.</span>
            </div>
            <div class="flex flex-row w-full gap-4 items-start justify-between">
              <div class="flex flex-col gap-2 -mt-8 w-full">
                <span class="font-medium">Statistics</span>
                <div class="w-full grid grid-cols-3 gap-2">
                  <div class="flex flex-col gap-2 p-4 rounded-md border border-neutral-200 dark:border-neutral-800">
                    <div class="flex flex-row items-start justify-between gap-2">
                      <div class="flex flex-col gap-1">
                        <span class="text-xs text-muted-foreground">Total plans</span>
                        <span class="text-lg font-medium">Plans</span>
                      </div>
                      <div class="text-muted-foreground">
                        <GitGraph class="w-4 h-4" />
                      </div>
                    </div>
                    <div class="flex flex-row items-start justify-between gap-2">
                      <div class="flex flex-row gap-2 items-center">
                        <span class="text-lg font-medium">1</span>
                        <span class="text-sm font-medium">+100%</span>
                      </div>
                      <div class="text-muted-foreground"></div>
                    </div>
                  </div>
                  <div class="flex flex-col gap-2 p-4 rounded-md border border-neutral-200 dark:border-neutral-800">
                    <div class="flex flex-row items-start justify-between gap-2">
                      <div class="flex flex-col gap-1">
                        <span class="text-xs text-muted-foreground">Total tickets</span>
                        <span class="text-lg font-medium">Tickets</span>
                      </div>
                      <div class="text-muted-foreground">
                        <GitGraph class="w-4 h-4" />
                      </div>
                    </div>
                    <div class="flex flex-row items-start justify-between gap-2">
                      <div class="flex flex-row gap-2 items-center">
                        <span class="text-lg font-medium">220</span>
                        <span class="text-sm font-medium">+100%</span>
                      </div>
                      <div class="text-muted-foreground"></div>
                    </div>
                  </div>
                  <div class="flex flex-col gap-2 p-4 rounded-md border border-neutral-200 dark:border-neutral-800">
                    <div class="flex flex-row items-start justify-between gap-2">
                      <div class="flex flex-col gap-1">
                        <span class="text-xs text-muted-foreground">Total revenue</span>
                        <span class="text-lg font-medium">Revenue</span>
                      </div>
                      <div class="text-muted-foreground">
                        <GitGraph class="w-4 h-4" />
                      </div>
                    </div>
                    <div class="flex flex-row items-start justify-between gap-2">
                      <div class="flex flex-row gap-2 items-center">
                        <span class="text-lg font-medium">5000</span>
                        <span class="text-sm font-medium">+100%</span>
                      </div>
                      <div class="text-muted-foreground"></div>
                    </div>
                  </div>
                </div>
              </div>
              <div class="w-max flex flex-col gap-4">
                <div class="flex flex-col gap-2 -mt-8">
                  <span class="font-medium">Notifications</span>
                  <div class="grid gap-2">
                    <For each={notifications()}>
                      {(n) => (
                        <div class="flex flex-col gap-2 p-4 rounded-md border border-neutral-200 dark:border-neutral-800">
                          <span class="text-sm font-medium">{n.type}</span>
                          <span class="text-xs font-medium">{n.message}</span>
                          <span class="text-xs font-medium">{dayjs(n.createdAt).fromNow()}</span>
                          <div class="flex flex-row items-center justify-between">
                            <div></div>
                            <Button size="sm" variant="secondary" asChild>
                              <As component={A} href={n.link}>
                                View
                              </As>
                            </Button>
                          </div>
                        </div>
                      )}
                    </For>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </Show>
    </div>
  );
}
