import { createAsync, A } from "@solidjs/router";
import { getActivities } from "@/lib/api/activity";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { cn } from "@/lib/utils";
import type { UserSession } from "@/lib/auth/util";
import { buttonVariants } from "../ui/button";
dayjs.extend(relativeTime);

export const Activities = (props: { session: UserSession }) => {
  const activities = createAsync(() => getActivities({ fromDate: null }));

  return (
    <div class="flex flex-col w-full">
      <A
        href={`/dashboard/o//${props.session.organization?.id}/activity`}
        class={cn(buttonVariants({ variant: "ghost" }), "flex flex-row items-center justify-between gap-2 px-4 pr-2")}
      >
        <span class="text-sm font-bold group-hover:underline group-hover:underline-offset-2">Activities</span>
        <div class="size-3 bg-neutral-100 dark:bg-neutral-900 rounded-full p-3 items-center justify-center flex text-muted-foreground text-xs">
          {activities?.()?.length}
        </div>
      </A>
    </div>
  );
};
