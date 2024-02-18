import { createAsync } from "@solidjs/router";
import { getStatistics } from "@/lib/api/statistics";
import { For, Match, Switch } from "solid-js";
import { TrendingDown, TrendingUp } from "lucide-solid";


export const Statistics = () => {
  const statistics = createAsync(() => getStatistics());

  return (<div class="w-full grid grid-cols-3 gap-2">
    <For each={statistics()}>
      {(stat) => (
        <div class="flex flex-col gap-2 p-4 rounded-md border border-neutral-200 dark:border-neutral-800">
          <div class="flex flex-row items-start justify-between gap-1">
            <div class="flex flex-col gap-0.5">
              <span class="text-xs text-muted-foreground">{stat.description}</span>
              <span class="text-lg font-medium">{stat.label}</span>
            </div>
            <div class="text-muted-foreground">
              <Switch>
                <Match when={stat.trend === "up"}>
                  <TrendingUp class="w-4 h-4" />
                </Match>
                <Match when={stat.trend === "down"}>
                  <TrendingDown class="w-4 h-4" />
                </Match>
              </Switch>
            </div>
          </div>
          <div class="flex flex-row items-start justify-between gap-2">
            <div class="flex flex-row gap-2 items-center">
              <span class="text-lg font-medium">{stat.value}{stat.unit}</span>
              <span class="text-sm font-medium">{stat.change}%</span>
            </div>
            <div class="text-muted-foreground"></div>
          </div>
        </div>
      )}
    </For>
  </div>);
}
