import { createAsync, A } from "@solidjs/router";
import { getPlans } from "@/lib/api/plans";
import { For, Show } from "solid-js";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { Progress } from "../ui/progress";
import { cn } from "@/lib/utils";
import { Badge } from "../ui/badge";
import { Separator } from "../ui/separator";
dayjs.extend(relativeTime);

export const UpcomingPlans = () => {
  const plans = createAsync(() => getPlans());

  return (
    <div class="grid xl:grid-cols-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 w-full gap-2">
      <For each={plans()}>
        {(plan) => (
          <A
            class="flex flex-col gap-4 items-start p-4 w-full h-full justify-start border border-neutral-200 dark:border-neutral-800 rounded-md hover:bg-neutral-100 dark:hover:bg-neutral-900 group shadow-sm hover:shadow"
            href={plan.link}
          >
            <div class="flex flex-col gap-2 w-full">
              <div class="flex flex-col gap-0.5">
                <span class="text-base font-medium">{plan.name}</span>
                <span class="text-xs text-muted-foreground break-words">in {dayjs().to(plan.createdAt, true)}</span>
              </div>
              <div class="w-full flex flex-row items-center justify-between gap-4">
                <Progress value={plan.progress} />
                <span class="text-muted-foreground text-xs">{plan.progress}%</span>
              </div>
            </div>
            <Separator />
            <div class="flex w-full flex-col gap-2">
              <span class="text-xs font-medium">{plan.todos.length} Todo<Show when={plan.todos.length > 1}>s</Show></span>
              <div class="flex flex-col gap-1 w-full">
                <For each={plan.todos.slice(0, 2)}>
                  {(todo) => (
                    <div class="flex flex-col gap-1 w-full border border-neutral-200 dark:border-neutral-800 rounded-md p-3 bg-background">
                      <div class="flex flex-row items-center gap-2">
                        <Badge
                          variant="outline"
                          class={cn("w-max", {
                            "text-yellow-500": todo.status === "in-progress",
                            "text-neutral-500": todo.status === "stale",
                            "text-red-500": todo.status === "urgent",
                          })}
                        >
                          {todo.status}
                        </Badge>
                        <span class="text-sm font-medium">{todo.title}</span>
                      </div>
                      <span class="text-muted-foreground w-full text-xs">
                        {todo.content.length > 0 ? todo.content : "No description..."}
                      </span>
                    </div>
                  )}
                </For>
                <Show when={plan.todos.length > 2}>
                  <div class="w-full flex flex-row items-center justify-center text-xs text-muted-foreground pt-2">
                    + more
                  </div>
                </Show>
              </div>
            </div>
          </A>
        )}
      </For>
    </div>
  );
};
