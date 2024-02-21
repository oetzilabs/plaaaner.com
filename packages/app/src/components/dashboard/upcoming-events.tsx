import { createAsync, A } from "@solidjs/router";
import { getPlans } from "@/lib/api/plans";
import { createSignal, For, onCleanup, onMount } from "solid-js";
import { As } from "@kobalte/core";
import { Button } from "@/components/ui/button";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { Progress } from "../ui/progress";
dayjs.extend(relativeTime);

const AnimatedPlan = (props: { name: string; createdAt: Date; progress: number }) => {
  const [prog, setProg] = createSignal(0);

  onMount(() => {
    const st = setTimeout(() => {
      setProg(props.progress);
    }, 500);
    onCleanup(() => {
      clearTimeout(st);
    });
  });

  return <Progress value={prog()} />;
};

export const UpcomingEvents = () => {
  const plans = createAsync(() => getPlans());

  return (
    <div class="grid grid-cols-4 w-full gap-2">
      <For each={plans()}>
        {(plan) => (
          <Button size="sm" variant="outline" asChild class="flex flex-col gap-3 items-start p-4 w-full h-full">
            <As component={A} href={plan.link}>
              <div class="flex flex-col gap-0.5">
                <span class="text-xs font-medium">{plan.name}</span>
                <span class="text-xs text-muted-foreground break-words">in {dayjs().to(plan.createdAt, true)}</span>
              </div>
              <AnimatedPlan {...plan} />
            </As>
          </Button>
        )}
      </For>
    </div>
  );
};
