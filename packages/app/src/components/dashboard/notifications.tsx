import { createAsync, A } from "@solidjs/router";
import { getNotifications } from "@/lib/api/notifications";
import { For } from "solid-js";
import { buttonVariants } from "@/components/ui/button";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { cn } from "@/lib/utils";
import type { UserSession } from "@/lib/auth/util";
dayjs.extend(relativeTime);

export const Notifications = (props: { session: UserSession }) => {
  const notifications = createAsync(() => getNotifications());

  return (
    <div class="grid gap-2 w-max max-w-[300px]">
      <For each={notifications()}>
        {(n) => (
          <A
            href={n.link}
            class={cn(
              buttonVariants({
                size: "sm",
                variant: "ghost",
              }),
              "w-full h-auto p-4 flex flex-col items-start gap-2 border border-neutral-200 dark:border-neutral-800",
            )}
          >
            <span class="text-xs font-medium">{n.message}</span>
            <div class="flex flex-row gap-1 font-normal text-muted-foreground">{n.contents}</div>
          </A>
        )}
      </For>
    </div>
  );
};
