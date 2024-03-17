import { createAsync, A } from "@solidjs/router";
import { getNotifications } from "@/lib/api/notifications";
import { buttonVariants } from "@/components/ui/button";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { cn } from "@/lib/utils";
import type { UserSession } from "@/lib/auth/util";
dayjs.extend(relativeTime);

export const Inbox = (props: { session: UserSession }) => {
  const notifications = createAsync(() => getNotifications());

  return (
    <div class="flex flex-col w-full">
      <A
        href={`/dashboard/organizations/${props.session.organization?.id}/notifications`}
        class={cn(
          buttonVariants({ variant: "ghost" }),
          "flex flex-row items-center justify-between gap-2 px-4 pr-2"
        )}
      >
        <span class="text-sm font-bold group-hover:underline group-hover:underline-offset-2">Inbox</span>
        <div class="size-3 bg-neutral-100 dark:bg-neutral-900 rounded-full p-3 items-center justify-center flex text-muted-foreground text-xs">
          {notifications()?.length}
        </div>
      </A>
    </div>
  );
};
