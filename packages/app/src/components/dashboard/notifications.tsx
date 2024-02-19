import { createAsync, A } from "@solidjs/router";
import { getNotifications } from "@/lib/api/notifications";
import { For } from "solid-js";
import { As } from "@kobalte/core";
import { Button } from "@/components/ui/button";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
dayjs.extend(relativeTime);

export const Notifications = () => {
  const notifications = createAsync(() => getNotifications());

  return (
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
  );
};
