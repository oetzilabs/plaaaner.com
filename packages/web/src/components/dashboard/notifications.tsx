import { buttonVariants } from "@/components/ui/button";
import { getNotifications } from "@/lib/api/notifications";
import type { UserSession } from "@/lib/auth/util";
import { cn } from "@/lib/utils";
import { A, createAsync } from "@solidjs/router";
import dayjs from "dayjs";
import localizedFormat from "dayjs/plugin/localizedFormat";
import relativeTime from "dayjs/plugin/relativeTime";
import { For, Show } from "solid-js";

dayjs.extend(relativeTime);
dayjs.extend(localizedFormat);

export const NotificationList = (props: { session: UserSession }) => {
  const notifications = createAsync(() => getNotifications());

  return (
    <div class="flex flex-col w-full gap-2">
      <div class="flex flex-col w-full gap-2">
        <A
          href={`/dashboard/o/${props.session.organization?.id}/notifications`}
          class="flex flex-col w-full font-medium text-sm"
        >
          Notifications
        </A>
        <div class="flex flex-col w-full gap-2">
          <Show when={notifications()}>
            {(notificationlist) => (
              <For
                each={notificationlist()}
                fallback={
                  <div class="w-full flex flex-col items-center justify-center bg-neutral-50 dark:bg-neutral-950 text-muted-foreground text-xs p-3 border border-neutral-200 dark:border-neutral-800 rounded-md">
                    <span>No Notifications,</span>
                    <span>you are good to go!</span>
                  </div>
                }
              >
                {(notification) => (
                  <A
                    href={`/dashboard/notifications/${notification.id}`}
                    class={cn(
                      buttonVariants({
                        variant: "ghost",
                        size: "sm",
                      }),
                      "flex flex-col w-full p-2 border relative border-neutral-200 dark:border-neutral-800 rounded-md min-h-10 h-auto",
                    )}
                  >
                    <div class="w-full flex flex-row items-center justify-between">
                      <div class="flex flex-row items-center justify-start w-full text-sm font-semibold">
                        {notification.title}
                      </div>
                      <div class="flex flex-row items-center justify-end w-max text-muted-foreground"></div>
                    </div>
                    <div class="flex flex-row w-full text-xs font-normal text-muted-foreground">
                      {notification.content}
                    </div>
                  </A>
                )}
              </For>
            )}
          </Show>
        </div>
      </div>
    </div>
  );
};
