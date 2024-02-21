import { createAsync } from "@solidjs/router";
import { getMetrics } from "@/lib/api/metrics";
import { For, JSX } from "solid-js";
import { Box, TrendingDown, TrendingUp } from "lucide-solid";
import { cn } from "@/lib/utils";

type MetricDirection = "up" | "down" | "neutral";

const metricIcons: Record<MetricDirection, JSX.Element> = {
  "up": <TrendingUp class="w-4 h-4" />,
  "down": <TrendingDown class="w-4 h-4" />,
  "neutral": <Box class="w-4 h-4" />
}

export const Metrics = () => {
  const metrics = createAsync(() => getMetrics());

  return (<div class="w-full grid grid-cols-3 gap-2">
    <For each={metrics()}>
      {(stat) => (
        <div class="flex flex-col gap-0.5 p-4 rounded-md border border-neutral-200 dark:border-neutral-800">
          <div class="flex flex-row items-start justify-between gap-1">
            <div class="flex flex-row gap-2 items-center">
              <span class="text-base font-medium capitalize">{stat.value.v} {stat.value.unit}</span>
              <span class="text-xs font-medium text-muted-foreground">({stat.change}%)</span>
            </div>
            <div class={cn({
              "text-emerald-400": stat.trend === "up",
              "text-rose-400": stat.trend === "down",
              "text-blue-400": stat.trend === "neutral",
            })}>
              {metricIcons[stat.trend]}
            </div>
          </div>
          <div class="flex flex-row items-start justify-between gap-2">
            <div class="flex flex-row gap-2 items-center">
              <span class="text-xs text-muted-foreground">Total {stat.value.unit} in a {stat.duration}</span>
            </div>
            <div class="text-muted-foreground"></div>
          </div>
        </div>
      )}
    </For>
  </div>);
}
